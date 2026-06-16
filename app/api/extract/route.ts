import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// @ts-expect-error — no types for pdf-parse
import pdfParse from "pdf-parse/lib/pdf-parse.js";

const EXTRACTION_PROMPT = `You are a precise Indian tax document parser. Below is the raw text extracted from a Form 16 / tax document.

Extract the following fields and return ONLY a valid JSON object. Use exact rupee amounts as stated. If a value is explicitly zero or absent, return 0.

{
  "grossSalary": <number: Gross Salary u/s 17(1)>,
  "tdsDeducted": <number: Total TDS deducted/deposited>,
  "hraExemption": <number: HRA exemption u/s 10(13A) — 0 if not present>,
  "employeePF": <number: Employee PF u/s 80C — 0 if not present>,
  "npsContribution": <number: NPS u/s 80CCD — 0 if not present>,
  "standardDeduction": <number: Standard deduction amount>,
  "totalDeductionsChapterVIA": <number: Total Chapter VI-A deductions>,
  "assessmentYear": "<string: e.g. 2024-25>",
  "employerName": "<string: employer name>",
  "taxableIncome": <number: Net taxable income>
}

Return ONLY the JSON object, no markdown, no explanation.

Document text:
`;

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
    const mimeType: string = fileData.type || "application/pdf";

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    let responseText = "";

    if (mimeType.startsWith("image/")) {
      // Image — use GPT-4o vision with base64
      const base64 = buffer.toString("base64");
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" } },
            { type: "text", text: EXTRACTION_PROMPT + "(image document — describe what you see)" },
          ],
        }],
      });
      responseText = response.choices[0]?.message?.content ?? "";
    } else {
      // PDF — extract text first, then send to GPT-4o
      let pdfText = "";
      try {
        const parsed = await pdfParse(buffer);
        pdfText = parsed.text ?? "";
      } catch (e) {
        return NextResponse.json({ error: "Failed to read PDF text. Try uploading a clearer PDF or use manual entry." }, { status: 422 });
      }

      if (!pdfText.trim()) {
        return NextResponse.json({ error: "PDF appears to be a scanned image with no selectable text. Try manual entry instead." }, { status: 422 });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: EXTRACTION_PROMPT + pdfText.slice(0, 12000), // cap at ~12k chars
        }],
      });
      responseText = response.choices[0]?.message?.content ?? "";
    }

    // Parse JSON from response
    let extracted: Record<string, unknown>;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      extracted = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return NextResponse.json({ error: "Could not parse GPT response. Try manual entry.", raw: responseText }, { status: 500 });
    }

    // Save to Supabase extracted_fields
    const fields = [
      { id: "gross-salary",       label: "Gross Salary (Sec 17(1))",       value: extracted.grossSalary },
      { id: "tds",                label: "TDS Deducted",                    value: extracted.tdsDeducted },
      { id: "hra",                label: "HRA Exemption u/s 10(13A)",       value: extracted.hraExemption },
      { id: "pf",                 label: "Employee PF (80C)",               value: extracted.employeePF },
      { id: "nps",                label: "NPS Contribution (80CCD)",        value: extracted.npsContribution },
      { id: "standard-deduction", label: "Standard Deduction",              value: extracted.standardDeduction },
      { id: "chapter-via",        label: "Total Chapter VI-A Deductions",   value: extracted.totalDeductionsChapterVIA },
    ];

    for (const field of fields) {
      await supabase.from("extracted_fields").upsert({
        id: field.id,
        user_id: user.id,
        label: field.label,
        value: Number(field.value) || 0,
        source: "Form 16",
        confidence: "high",
        explanation: `Extracted from ${doc.name} for AY ${extracted.assessmentYear ?? "2024-25"}.`,
      });
    }

    await supabase.from("tax_documents").update({ status: "done" }).eq("id", documentId);
    return NextResponse.json({ success: true, extracted });
  } catch (err: unknown) {
    console.error("Extraction error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
