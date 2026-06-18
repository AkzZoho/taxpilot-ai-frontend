import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const EXTRACTION_PROMPT = `You are a precise Indian tax document parser. Extract the following fields from this Form 16.

Return ONLY a valid JSON object. Use exact rupee amounts as shown. If a value is zero or absent, use 0.

{
  "grossSalary": <number: Gross Salary u/s 17(1)>,
  "tdsDeducted": <number: Total TDS deducted at source and deposited by employer>,
  "hraExemption": <number: HRA exemption u/s 10(13A) — 0 if not present>,
  "employeePF": <number: Employee PF u/s 80C — 0 if not present>,
  "npsContribution": <number: NPS u/s 80CCD — 0 if not present>,
  "standardDeduction": <number: Standard deduction>,
  "totalDeductionsChapterVIA": <number: Total Chapter VI-A deductions>,
  "taxOnTotalIncome": <number: Tax on total income as computed in Form 16 Part B (before cess/surcharge) — 0 if not shown>,
  "taxAfterCess": <number: Final tax payable including 4% Health & Education Cess and after 87A rebate — this is the total tax liability as per Form 16>,
  "taxRefundable": <number: Tax refundable to employee (positive number if employer computed a refund, i.e. TDS > tax liability) — 0 if not present>,
  "taxPayableByEmployee": <number: Additional tax still to be paid by employee if TDS fell short — 0 if not present>,
  "assessmentYear": "<string: e.g. 2025-26>",
  "employerName": "<string>",
  "taxableIncome": <number: Net taxable income after all deductions>
}

IMPORTANT: taxRefundable and taxPayableByEmployee are mutually exclusive — only one can be non-zero. They come from the "Balance Tax Payable / (Tax Refundable)" line at the bottom of Part B.

Return ONLY the JSON, no markdown, no explanation.`;

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

    // Upload file to OpenAI (supports both PDF and images, with OCR for scanned docs)
    const uploadedFile = await openai.files.create({
      file: new File([buffer], doc.name ?? "form16.pdf", { type: mimeType }),
      purpose: "user_data",
    });

    // Use Responses API — supports PDF/image OCR natively
    let responseText = "";
    try {
      const response = await openai.responses.create({
        model: "gpt-4o",
        input: [
          {
            role: "user",
            content: [
              { type: "input_file", file_id: uploadedFile.id },
              { type: "input_text", text: EXTRACTION_PROMPT },
            ],
          },
        ],
      });
      // output_text is a top-level convenience property on the Response object
      responseText = response.output_text ?? "";
    } finally {
      await openai.files.delete(uploadedFile.id).catch(() => {});
    }

    if (!responseText) {
      return NextResponse.json({ error: "No response from AI. Try manual entry." }, { status: 500 });
    }

    // Parse JSON
    let extracted: Record<string, unknown>;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      extracted = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch {
      return NextResponse.json({ error: "Could not parse AI response. Try manual entry.", raw: responseText }, { status: 500 });
    }

    // Save to Supabase
    const fields = [
      { id: "gross-salary",         label: "Gross Salary (Sec 17(1))",      value: extracted.grossSalary },
      { id: "tds",                  label: "TDS Deducted by Employer",       value: extracted.tdsDeducted },
      { id: "hra",                  label: "HRA Exemption u/s 10(13A)",      value: extracted.hraExemption },
      { id: "pf",                   label: "Employee PF (80C)",              value: extracted.employeePF },
      { id: "nps",                  label: "NPS Contribution (80CCD)",       value: extracted.npsContribution },
      { id: "standard-deduction",   label: "Standard Deduction",             value: extracted.standardDeduction },
      { id: "chapter-via",          label: "Total Chapter VI-A Deductions",  value: extracted.totalDeductionsChapterVIA },
      { id: "tax-after-cess",       label: "Tax Liability (as per Form 16)", value: extracted.taxAfterCess },
      { id: "tax-refundable",       label: "Tax Refundable (Form 16)",       value: extracted.taxRefundable },
      { id: "tax-payable-employee", label: "Balance Tax Payable",            value: extracted.taxPayableByEmployee },
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
