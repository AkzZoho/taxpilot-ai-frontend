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
import { formatINR } from "@/lib/utils";
import type { ExtractedField } from "@/types/tax";
import { ArrowRight, AlertTriangle, Loader2, Sparkles, FileSearch } from "lucide-react";

type DBField = {
  id: string;
  label: string;
  value: number;
  source: string;
  confidence: string;
  explanation: string;
};

function toExtractedField(f: DBField): ExtractedField {
  return {
    id: f.id,
    label: f.label,
    value: f.value,
    source: f.source as ExtractedField["source"],
    confidence: f.confidence as ExtractedField["confidence"],
    explanation: f.explanation,
  };
}

export default function ReviewPage() {
  const router = useRouter();
  const [fields, setFields] = useState<DBField[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<{ id: string; name: string; type: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const [{ data: dbFields }, { data: docs }] = await Promise.all([
      supabase.from("extracted_fields").select("*").order("id"),
      supabase.from("tax_documents").select("id, name, type").eq("type", "Form 16").order("created_at", { ascending: false }),
    ]);
    if (dbFields) {
      setFields(dbFields);
      const vals: Record<string, string> = {};
      (dbFields as DBField[]).forEach((f) => { vals[f.id] = String(f.value); });
      setEditValues(vals);
    }
    if (docs) setDocuments(docs);
    setLoading(false);
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

  async function handleConfirm() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await Promise.all(
      fields.map((f) =>
        supabase
          .from("extracted_fields")
          .update({ value: parseFloat(editValues[f.id] ?? "0") || 0 })
          .eq("id", f.id)
          .eq("user_id", user.id)
      )
    );
    setConfirmed(true);
    setTimeout(() => router.push("/regime-comparison"), 800);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center gap-2 mt-20 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your data…
        </div>
      </AppShell>
    );
  }

  const hasDocument = documents.length > 0;
  const hasFields = fields.length > 0;

  return (
    <AppShell>
      <div className="animate-fade-up">
        <FlowProgress />
        <h1 className="page-title">Review Extraction</h1>
        <p className="page-subtitle">Verify every value from your Form 16. Edit anything that looks wrong.</p>

        {/* No Form 16 uploaded */}
        {!hasDocument && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
            <FileSearch className="mx-auto h-9 w-9 text-amber-500 mb-3" />
            <p className="font-semibold text-amber-800">No Form 16 uploaded yet</p>
            <p className="mt-1 text-sm text-amber-700">Upload your Form 16 first so TaxPilot can extract your tax values.</p>
            <Button className="mt-4" onClick={() => router.push("/upload")}>Go to Upload</Button>
          </div>
        )}

        {/* Form 16 uploaded but not extracted */}
        {hasDocument && !hasFields && (
          <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-brand-800">Ready to extract from your Form 16</p>
                <p className="mt-0.5 text-sm text-brand-700">Found: <strong>{documents[0].name}</strong></p>
                <p className="mt-1 text-xs text-brand-600">AI will read your PDF and extract salary, TDS, deductions, and HRA — no guessing.</p>
              </div>
            </div>
            {extractError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                {extractError}
              </div>
            )}
            <Button className="mt-4 w-full" onClick={extractFromPDF} disabled={extracting}>
              {extracting
                ? <><Loader2 className="h-4 w-4 animate-spin" />Extracting from PDF…</>
                : <><Sparkles className="h-4 w-4" />Extract values from Form 16</>}
            </Button>
          </div>
        )}

        {/* Editable extracted fields */}
        {hasFields && (
          <>
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
              <Sparkles className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
              <p className="text-xs text-brand-700 leading-5">
                Extracted from <strong>{documents[0]?.name ?? "your Form 16"}</strong>. 
                Edit any value that doesn&apos;t match — your changes are saved automatically on confirm.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {fields.map((field) => (
                <EditableFieldCard
                  key={field.id}
                  field={toExtractedField(field)}
                  rawValue={editValues[field.id] ?? "0"}
                  onChange={(v) => setEditValues((prev) => ({ ...prev, [field.id]: v }))}
                />
              ))}
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
              <div>
                <p className="text-sm font-bold text-slate-900">All values correct?</p>
                <p className="text-xs text-slate-500 mt-0.5">Your edits will be saved and used for regime comparison.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button variant="secondary" size="sm" onClick={extractFromPDF} disabled={extracting || !hasDocument}>
                  {extracting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Re-extract"}
                </Button>
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
            value={focused ? rawValue : (numericVal === 0 ? "0" : numericVal.toLocaleString("en-IN"))}
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
