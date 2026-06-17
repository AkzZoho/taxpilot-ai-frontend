"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { FlowProgress } from "@/components/ui/flow-progress";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { AlertTriangle, CheckCircle2, ExternalLink, FileText, Loader2, PartyPopper } from "lucide-react";

const mistakes = [
  "Mismatched TDS between Form 16 and 26AS",
  "Missing interest income from savings account",
  "Incorrect HRA exemption calculation",
  "Forgetting employer NPS contribution (80CCD(2))",
];

export default function FilingAssistantPage() {
  const [step, setStep] = useState<"guide" | "ready">("guide");
  const [loading, setLoading] = useState(true);
  const [hasDoc, setHasDoc] = useState(false);
  const [hasFields, setHasFields] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ count: docCount }, { count: fieldCount }] = await Promise.all([
        supabase.from("tax_documents").select("*", { count: "exact", head: true }),
        supabase.from("extracted_fields").select("*", { count: "exact", head: true }),
      ]);
      setHasDoc((docCount ?? 0) > 0);
      setHasFields((fieldCount ?? 0) > 0);
      setLoading(false);
    }
    load();
  }, []);

  const checklist = [
    { item: "Form 16 uploaded", done: hasDoc },
    { item: "Values extracted & reviewed", done: hasFields },
    { item: "Regime comparison done", done: false },
    { item: "Form 26AS cross-check", done: false },
    { item: "AIS validation", done: false },
    { item: "Final submission", done: false },
  ];

  const doneCount = checklist.filter((c) => c.done).length;

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center gap-2 mt-20 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="animate-fade-up">
        <FlowProgress />
        <h1 className="page-title">Filing Assistant</h1>
        <p className="page-subtitle">Complete these steps before filing your ITR.</p>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Card className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Your ITR Form</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                <FileText className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <p className="text-3xl font-black text-brand-700">ITR-1</p>
                <p className="text-xs text-slate-500">Sahaj</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-5 flex-1">
              For salaried individuals with salary income, one house property, and other sources (excluding capital gains).
            </p>
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
              Verify: no capital gains or business income before selecting ITR-1.
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Filing Checklist</p>
            <div className="mt-4 space-y-3">
              {checklist.map((c) => (
                <div key={c.item} className="flex items-center gap-2.5">
                  {c.done
                    ? <CheckCircle2 className="h-4 w-4 text-trust-600 shrink-0" />
                    : <div className="h-4 w-4 rounded-full border-2 border-slate-200 shrink-0" />}
                  <span className={`text-sm ${c.done ? "text-slate-800 font-medium" : "text-slate-400"}`}>
                    {c.item}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-slate-100">
              <div
                className="h-1.5 rounded-full bg-trust-500 transition-all"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">{doneCount}/{checklist.length} steps done</p>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Avoid These Mistakes</p>
            <div className="mt-4 space-y-2.5">
              {mistakes.map((m, i) => (
                <div key={i} className="flex gap-2.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-5">{m}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {!hasDoc && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Upload Form 16 first</p>
              <p className="text-xs text-amber-700 mt-0.5">Complete Upload, Review, and Compare before filing.</p>
            </div>
          </div>
        )}

        {step === "guide" ? (
          <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900">Ready to file on the Income Tax portal?</p>
              <p className="text-xs text-slate-500 mt-0.5">TaxPilot has prepared your values. Head to incometax.gov.in to complete filing.</p>
            </div>
            <Button size="lg" onClick={() => setStep("ready")} className="shrink-0" disabled={!hasFields}>
              I am ready to file
            </Button>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-trust-200 bg-trust-50 p-6 text-center">
            <PartyPopper className="mx-auto h-10 w-10 text-trust-600 mb-3" />
            <p className="text-base font-bold text-trust-800">Great work! You are all set.</p>
            <p className="mt-1 text-sm text-trust-700">Use your TaxPilot summary to complete filing on the official portal.</p>
            <a
              href="https://www.incometax.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-trust-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-trust-700 transition"
            >
              Open Income Tax Portal <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>
    </AppShell>
  );
}
