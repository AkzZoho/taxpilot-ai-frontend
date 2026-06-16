import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();

    // Get authenticated Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    // Verify user session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the document record
    const { data: doc } = await supabase
      .from("tax_documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (!doc?.storage_path) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("tax-documents")
      .download(doc.storage_path);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: "Failed to download document" }, { status: 500 });
    }

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = fileData.type || "application/pdf";

    // Send to Claude for extraction
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: mimeType as "application/pdf" | "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64,
              },
            },
            {
              type: "text",
              text: `You are a precise Indian tax document parser. Extract the following fields from this Form 16 / tax document. Return ONLY a valid JSON object with exactly these fields. If a value is not present or is zero, return 0. Do not guess — only extract values explicitly stated in the document.

{
  "grossSalary": <number: Gross Salary u/s 17(1) in rupees>,
  "taxableIncome": <number: Total taxable income in rupees>,
  "tdsDeducted": <number: Total TDS deducted/paid in rupees>,
  "hraExemption": <number: HRA exemption u/s 10(13A) in rupees, 0 if not present>,
  "employeePF": <number: Employee PF contribution u/s 80C in rupees, 0 if not present>,
  "npsContribution": <number: NPS contribution u/s 80CCD in rupees, 0 if not present>,
  "standardDeduction": <number: Standard deduction in rupees>,
  "professionalTax": <number: Professional tax in rupees, 0 if not present>,
  "totalDeductionsChapterVIA": <number: Total Chapter VI-A deductions in rupees>,
  "assessmentYear": "<string: Assessment year e.g. 2024-25>",
  "employerName": "<string: Employer name>",
  "panOfEmployee": "<string: PAN of employee if visible, else empty string>"
}

Return only the JSON, no explanation.`,
            },
          ],
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse Claude's response
    let extracted: Record<string, unknown>;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      extracted = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return NextResponse.json({ error: "Failed to parse extraction result", raw: responseText }, { status: 500 });
    }

    // Save extracted fields to Supabase
    const fields = [
      { id: "gross-salary", label: "Gross Salary (Sec 17(1))", value: extracted.grossSalary, source: "Form 16", confidence: "high", explanation: "Total salary income as declared by employer under Section 17(1)." },
      { id: "tds", label: "TDS Deducted", value: extracted.tdsDeducted, source: "Form 16", confidence: "high", explanation: "Total tax deducted at source by the employer and deposited against your PAN." },
      { id: "hra", label: "HRA Exemption", value: extracted.hraExemption, source: "Form 16", confidence: "high", explanation: "House Rent Allowance exemption claimed u/s 10(13A). Zero if you live in own house or didn't claim HRA." },
      { id: "pf", label: "Employee PF (80C)", value: extracted.employeePF, source: "Form 16", confidence: "high", explanation: "Employee Provident Fund contribution eligible under Section 80C." },
      { id: "nps", label: "NPS Contribution (80CCD)", value: extracted.npsContribution, source: "Form 16", confidence: "high", explanation: "National Pension Scheme contribution under Section 80CCD." },
      { id: "standard-deduction", label: "Standard Deduction", value: extracted.standardDeduction, source: "Form 16", confidence: "high", explanation: "Flat standard deduction available to all salaried employees." },
      { id: "chapter-via", label: "Chapter VI-A Deductions", value: extracted.totalDeductionsChapterVIA, source: "Form 16", confidence: "high", explanation: "Total deductions claimed under Chapter VI-A (80C, 80D, 80CCD etc.)." },
    ];

    // Upsert all fields for this user
    for (const field of fields) {
      await supabase.from("extracted_fields").upsert({
        id: field.id,
        user_id: user.id,
        label: field.label,
        value: field.value ?? 0,
        source: field.source,
        confidence: field.confidence,
        explanation: field.explanation,
      });
    }

    // Mark document as processed
    await supabase.from("tax_documents").update({ status: "done" }).eq("id", documentId);

    return NextResponse.json({ success: true, fields: extracted });
  } catch (err) {
    console.error("Extraction error:", err);
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
