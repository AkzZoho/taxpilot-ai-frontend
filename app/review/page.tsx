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
import { ArrowRight, AlertTriangle, Loader2, Sparkles, FileSearch, PenLine } from "lucide-react";

type DBField = {
  id: string; label: string; value: number;
  source: string; confidence: string; explanation: string;
};

const FORM16_FIELDS: Omit<DBField, "value">[] = [
  { id: "gross-salary",      label: "Gross Salary (Sec 17(1))",       source: "Form 16", confidence: "high",   explanation: "Total salary income declared by employer under Section 17(1)." },
  { id: "tds",               label: "TDS Deducted",                    source: "Form 16", confidence: "high",   explanation: "Total tax deducted at source and deposited against your PAN." },
  { id: "hra",               label: "HRA Exemption u/s 10(13A)",       source: "Form 16", confidence: "high",   explanation: "House Rent Allowance exemption. Enter 0 if not claimed." },
  { id: "pf",                label: "Employee PF (80C)",               source: "Form 16", confidence: "high",   explanation: "Employee PF contribution eligible under Section 80C. Enter 0 if not on Form 16." },
  { id: "nps",               label: "NPS Contribution (80CCD)",        source: "Form 16", confidence: "high",   explanation: "National Pension Scheme deduction. Enter 0 if not present." },
  { id: "standard-deduction",label: "Standard Deduction",              source: "Form 16", confidence: "high",   explanation: "Flat ₹75,000 standard deduction for salaried employees (AY 2024-25)." },
  { id: "chapter-via",       label: "Total Chapter VI-A Deductions",   source: "Form 16", confidence: "high",   explanation: "Sum of all deductions under 80C, 80D, 80CCD etc." },
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
    setTimeout(() => router.push("/regime-comparison"), 800);
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
                  {confirmed ? "Saving…" : <>Confirm & Compare Regimes <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
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
