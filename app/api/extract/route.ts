import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const EXTRACTION_PROMPT = `You are a precise Indian tax document parser. Extract the following fields from this Form 16 or tax document.

Return ONLY a valid JSON object with exactly these fields. Use the exact rupee amounts as shown in the document. If a value is explicitly zero or not present, return 0. Do NOT guess or estimate.

{
  "grossSalary": <number: Gross Salary u/s 17(1) in rupees>,
  "tdsDeducted": <number: Total TDS deducted/deposited in rupees>,
  "hraExemption": <number: HRA exemption u/s 10(13A) in rupees — 0 if not present>,
  "employeePF": <number: Employee PF u/s 80C in rupees — 0 if not present>,
  "npsContribution": <number: NPS u/s 80CCD in rupees — 0 if not present>,
  "standardDeduction": <number: Standard deduction in rupees — 75000 for AY 2024-25 if salaried>,
  "totalDeductionsChapterVIA": <number: Total Chapter VI-A deductions in rupees — 0 if all zero>,
  "assessmentYear": "<string: e.g. 2024-25>",
  "employerName": "<string: employer name>",
  "taxableIncome": <number: Net taxable income in rupees>
}

Return only the JSON object, no markdown, no explanation.`;

export async function POST(req: NextRequest) {
  try {
    const { documentId } = await req.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: doc } = await supabase
      .from("tax_documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", user.id)
      .single();

    if (!doc?.storage_path) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("tax-documents")
      .download(doc.storage_path);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: "Failed to download document" }, { status: 500 });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType: string = fileData.type || "application/pdf";

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let responseText = "";

    if (mimeType.startsWith("image/")) {
      // Image file — use GPT-4o vision directly
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
              },
              { type: "text", text: EXTRACTION_PROMPT },
            ],
          },
        ],
      });
      responseText = response.choices[0]?.message?.content ?? "";
    } else {
      // PDF — upload to OpenAI Files API then use with GPT-4o
      const file = await openai.files.create({
        file: new File([buffer], doc.name ?? "form16.pdf", { type: "application/pdf" }),
        purpose: "user_data",
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            // @ts-expect-error — file content type supported by gpt-4o
            content: [
              { type: "file", file: { file_id: file.id } },
              { type: "text", text: EXTRACTION_PROMPT },
            ],
          },
        ],
      });
      responseText = response.choices[0]?.message?.content ?? "";

      // Clean up the uploaded file
      await openai.files.del(file.id).catch(() => {});
    }

    // Parse JSON from response
    let extracted: Record<string, unknown>;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      extracted = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return NextResponse.json({ error: "Could not parse extraction result", raw: responseText }, { status: 500 });
    }

    // Save to Supabase extracted_fields
    const fields = [
      { id: "gross-salary",       label: "Gross Salary (Sec 17(1))",     value: extracted.grossSalary,              confidence: "high" },
      { id: "tds",                label: "TDS Deducted",                  value: extracted.tdsDeducted,              confidence: "high" },
      { id: "hra",                label: "HRA Exemption u/s 10(13A)",     value: extracted.hraExemption,             confidence: "high" },
      { id: "pf",                 label: "Employee PF (80C)",             value: extracted.employeePF,               confidence: "high" },
      { id: "nps",                label: "NPS Contribution (80CCD)",      value: extracted.npsContribution,          confidence: "high" },
      { id: "standard-deduction", label: "Standard Deduction",            value: extracted.standardDeduction,        confidence: "high" },
      { id: "chapter-via",        label: "Total Chapter VI-A Deductions", value: extracted.totalDeductionsChapterVIA, confidence: "high" },
    ];

    for (const field of fields) {
      await supabase.from("extracted_fields").upsert({
        id: field.id,
        user_id: user.id,
        label: field.label,
        value: Number(field.value) || 0,
        source: "Form 16",
        confidence: field.confidence,
        explanation: `Extracted from ${doc.name} for AY ${extracted.assessmentYear ?? "2024-25"}.`,
      });
    }

    await supabase.from("tax_documents").update({ status: "done" }).eq("id", documentId);

    return NextResponse.json({ success: true, extracted });
  } catch (err: unknown) {
    console.error("Extraction error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
