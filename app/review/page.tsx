"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FlowProgress } from "@/components/ui/flow-progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/tax/confidence-badge";
import { ExplainNumberDrawer } from "@/components/tax/explain-number-drawer";
import { createClient } from "@/lib/supabase/client";
import type { ExtractedField } from "@/types/tax";
import { ArrowRight, AlertTriangle, Loader2, Sparkles, FileSearch, PenLine, TrendingDown, TrendingUp, Banknote } from "lucide-react";
import { formatINR } from "@/lib/utils";

type DBField = {
  id: string; label: string; value: number;
  source: string; confidence: string; explanation: string;
};

const FORM16_FIELDS: Omit<DBField, "value">[] = [
  { id: "gross-salary",         label: "Gross Salary (Sec 17(1))",       source: "Form 16", confidence: "high",   explanation: "Total salary income declared by employer under Section 17(1) — this is before any deductions." },
  { id: "standard-deduction",   label: "Standard Deduction",              source: "Form 16", confidence: "high",   explanation: "Flat ₹75,000 automatically deducted for all salaried employees (FY 2025-26)." },
  { id: "hra",                  label: "HRA Exemption u/s 10(13A)",       source: "Form 16", confidence: "high",   explanation: "House Rent Allowance exemption — the portion of your HRA that is tax-free. Enter 0 if you don't pay rent." },
  { id: "pf",                   label: "Employee PF (80C)",               source: "Form 16", confidence: "high",   explanation: "Your share of Provident Fund — eligible under Section 80C (up to ₹1.5L total)." },
  { id: "nps",                  label: "NPS Contribution (80CCD)",        source: "Form 16", confidence: "high",   explanation: "National Pension Scheme contribution. Enter 0 if not present." },
  { id: "chapter-via",          label: "Total Chapter VI-A Deductions",   source: "Form 16", confidence: "high",   explanation: "Total of all tax-saving deductions: 80C investments, 80D health insurance, etc." },
  { id: "tax-after-cess",       label: "Tax Liability (as per Form 16)",  source: "Form 16", confidence: "high",   explanation: "The total tax your employer computed on your income — after all deductions, cess, and 87A rebate. This is the official figure from Part B." },
  { id: "tds",                  label: "TDS Deducted by Employer",        source: "Form 16", confidence: "high",   explanation: "Tax Deducted at Source — the tax your company already deducted from your salary each month and paid to the government on your behalf." },
  { id: "tax-refundable",       label: "Tax Refundable to You",           source: "Form 16", confidence: "high",   explanation: "If your employer deducted more TDS than your actual tax liability, this is how much the government owes you back. Enter 0 if not shown." },
  { id: "tax-payable-employee", label: "Balance Tax Still to Pay",        source: "Form 16", confidence: "high",   explanation: "If TDS was less than actual tax, this is the remaining amount you need to pay. Enter 0 if not shown." },
];

function toExtractedField(f: DBField): ExtractedField {
  return {
    id: f.id, label: f.label, value: f.value,
    source: f.source as ExtractedField["source"],
    confidence: f.confidence as ExtractedField["confidence"],
    explanation: f.explanation,
  };
}

type Mode = "loading" | "no-doc" | "extract" | "manual" | "edit";

export default function ReviewPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("loading");
  const [fields, setFields] = useState<DBField[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [manualValues, setManualValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(FORM16_FIELDS.map((f) => [f.id, ""]))
  );
  const [documents, setDocuments] = useState<{ id: string; name: string }[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createClient();
    const [{ data: dbFields }, { data: docs }] = await Promise.all([
      supabase.from("extracted_fields").select("*").order("id"),
      supabase.from("tax_documents").select("id,name,type").eq("type", "Form 16").order("created_at", { ascending: false }),
    ]);
    const hasDocs = docs && docs.length > 0;
    const hasFields = dbFields && dbFields.length > 0;
    if (docs) setDocuments(docs);
    if (dbFields && hasFields) {
      setFields(dbFields as DBField[]);
      const vals: Record<string, string> = {};
      (dbFields as DBField[]).forEach((f) => { vals[f.id] = String(f.value); });
      setEditValues(vals);
      setMode("edit");
    } else if (hasDocs) {
      setMode("extract");
    } else {
      setMode("no-doc");
    }
  }

  async function extractFromPDF() {
    if (!documents[0]) return;
    setExtracting(true);
    setExtractError("");
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: documents[0].id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed");
      await load();
    } catch (err: unknown) {
      setExtractError(err instanceof Error ? err.message : "Extraction failed");
    }
    setExtracting(false);
  }

  async function saveManual() {
    setSaving(true);
    const payload = FORM16_FIELDS.map((f) => ({
      ...f,
      value: parseFloat(manualValues[f.id] || "0") || 0,
    }));
    await fetch("/api/seed-fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fields: payload }),
    });
    setSaving(false);
    await load();
  }

  async function handleConfirm() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await Promise.all(
      fields.map((f) =>
        supabase.from("extracted_fields")
          .update({ value: parseFloat(editValues[f.id] ?? "0") || 0 })
          .eq("id", f.id).eq("user_id", user.id)
      )
    );
    setConfirmed(true);
    setTimeout(() => router.push("/advisor"), 800);
  }

  if (mode === "loading") {
    return <AppShell><div className="flex items-center justify-center gap-2 mt-20 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Loading…</div></AppShell>;
  }

  return (
    <AppShell>
      <div className="animate-fade-up">
        <FlowProgress />
        <h1 className="page-title">Review Extraction</h1>
        <p className="page-subtitle">Verify every value from your Form 16. Edit anything that looks wrong.</p>

        {/* No Form 16 uploaded */}
        {mode === "no-doc" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <FileSearch className="mx-auto h-9 w-9 text-amber-500 mb-3" />
            <p className="font-semibold text-amber-800">No Form 16 uploaded yet</p>
            <p className="mt-1 text-sm text-amber-700">Upload your Form 16 first, then come back to extract values.</p>
            <Button className="mt-4" onClick={() => router.push("/upload")}>Go to Upload</Button>
          </div>
        )}

        {/* Form 16 uploaded — choose extraction method */}
        {mode === "extract" && (
          <div className="mt-6 space-y-4">
            {/* AI extraction */}
            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-brand-800">Auto-extract via AI</p>
                  <p className="mt-0.5 text-sm text-brand-700">
                    Found: <strong>{documents[0]?.name}</strong>
                  </p>
                  <p className="text-xs text-brand-600 mt-1">Claude will read your PDF and extract every value accurately.</p>
                </div>
              </div>
              {extractError && (
                <div className="mt-3 flex gap-2 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{extractError} — use manual entry below instead.</span>
                </div>
              )}
              <Button className="mt-4 w-full" onClick={extractFromPDF} disabled={extracting}>
                {extracting
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Extracting from PDF…</>
                  : <><Sparkles className="h-4 w-4" />Extract values from Form 16</>}
              </Button>
            </div>

            {/* Manual entry */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start gap-3 mb-4">
                <PenLine className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800">Enter values manually</p>
                  <p className="text-xs text-slate-500 mt-0.5">Type your Form 16 figures directly — takes 2 minutes.</p>
                </div>
              </div>
              <div className="space-y-3">
                {FORM16_FIELDS.map((f) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <label className="flex-1 text-sm text-slate-700">{f.label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₹</span>
                      <input
                        type="number"
                        placeholder="0"
                        value={manualValues[f.id]}
                        onChange={(e) => setManualValues((p) => ({ ...p, [f.id]: e.target.value }))}
                        className="focus-ring w-40 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-7 pr-3 text-right text-sm font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-5 w-full" variant="secondary" onClick={saveManual} disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : "Save & Review"}
              </Button>
            </div>
          </div>
        )}

        {/* Editable extracted/entered fields */}
        {mode === "edit" && (
          <>
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
              <Sparkles className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
              <p className="text-xs text-brand-700 leading-5">
                Values from <strong>{documents[0]?.name ?? "your Form 16"}</strong>.
                Edit any figure that doesn&apos;t match your document.
              </p>
            </div>

            {/* Tax at a glance summary */}
            <TaxAtAGlance fields={fields} editValues={editValues} />

            <div className="mt-4 space-y-3">
              {fields.map((field) => (
                <EditableFieldCard
                  key={field.id}
                  field={toExtractedField(field)}
                  rawValue={editValues[field.id] ?? "0"}
                  onChange={(v) => setEditValues((p) => ({ ...p, [field.id]: v }))}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
              <div>
                <p className="text-sm font-bold text-slate-900">All values correct?</p>
                <p className="text-xs text-slate-500 mt-0.5">Your edits will be saved and used for regime comparison.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {documents[0] && (
                  <Button variant="secondary" size="sm" onClick={extractFromPDF} disabled={extracting}>
                    {extracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Re-extract"}
                  </Button>
                )}
                <Button size="lg" onClick={handleConfirm} disabled={confirmed}>
                  {confirmed ? "Saving…" : <>Confirm & Talk to Advisor <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function TaxAtAGlance({ fields, editValues }: { fields: DBField[]; editValues: Record<string, string> }) {
  function val(id: string) {
    const edited = editValues[id];
    if (edited !== undefined) return parseFloat(edited) || 0;
    return fields.find((f) => f.id === id)?.value ?? 0;
  }

  const tds = val("tds");
  const taxLiability = val("tax-after-cess");
  const refundable = val("tax-refundable");
  const payable = val("tax-payable-employee");

  // If Form 16 has explicit refund/payable, use that; otherwise derive it
  const hasFormData = taxLiability > 0 || refundable > 0 || payable > 0;
  if (!hasFormData && tds === 0) return null;

  const derivedRefund = tds > 0 && taxLiability > 0 ? Math.max(0, tds - taxLiability) : 0;
  const derivedPayable = tds > 0 && taxLiability > 0 ? Math.max(0, taxLiability - tds) : 0;

  const finalRefund = refundable > 0 ? refundable : derivedRefund;
  const finalPayable = payable > 0 ? payable : derivedPayable;
  const isRefund = finalRefund > 0;

  return (
    <div className={`mt-4 rounded-2xl border-2 p-5 ${isRefund ? "border-trust-200 bg-trust-50" : finalPayable > 0 ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2 mb-3">
        <Banknote className={`h-5 w-5 ${isRefund ? "text-trust-600" : "text-amber-600"}`} />
        <h3 className="font-bold text-slate-900 text-sm">Your Tax at a Glance</h3>
      </div>
      <div className="space-y-2 text-sm">
        {taxLiability > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600 flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-slate-400" />
              Tax your employer calculated on your income
            </span>
            <span className="font-semibold text-slate-900">{formatINR(taxLiability)}</span>
          </div>
        )}
        {tds > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-600 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-trust-500" />
              Tax already paid by your employer (TDS)
            </span>
            <span className="font-semibold text-trust-700">{formatINR(tds)}</span>
          </div>
        )}
        {(finalRefund > 0 || finalPayable > 0) && (
          <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
            {isRefund ? (
              <>
                <div>
                  <p className="font-bold text-trust-800">You are owed a refund ✅</p>
                  <p className="text-xs text-trust-700 mt-0.5">Your employer deducted more TDS than needed — the government will return this to your bank account after you file.</p>
                </div>
                <span className="text-xl font-black text-trust-700 shrink-0 ml-4">{formatINR(finalRefund)}</span>
              </>
            ) : (
              <>
                <div>
                  <p className="font-bold text-amber-800">Balance tax to pay ⚠️</p>
                  <p className="text-xs text-amber-700 mt-0.5">You need to pay this remaining amount when filing your ITR (via Self-Assessment Tax).</p>
                </div>
                <span className="text-xl font-black text-amber-700 shrink-0 ml-4">{formatINR(finalPayable)}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EditableFieldCard({ field, rawValue, onChange }: {
  field: ExtractedField; rawValue: string; onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const numericVal = parseFloat(rawValue) || 0;
  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">{field.label}</h3>
          <ConfidenceBadge confidence={field.confidence} />
        </div>
        <p className="mt-0.5 text-xs text-slate-500">Source: {field.source}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">₹</span>
          <input
            type={focused ? "number" : "text"}
            value={focused ? rawValue : numericVal.toLocaleString("en-IN")}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="focus-ring w-44 rounded-xl border border-slate-200 bg-white py-2.5 pl-7 pr-3 text-right text-sm font-semibold text-slate-900"
          />
        </div>
        <ExplainNumberDrawer field={{ ...field, value: numericVal }} />
      </div>
    </Card>
  );
}
