import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, FileText } from "lucide-react";

const checklist = [
  { item: "Form 16 uploaded", done: false },
  { item: "Form 26AS uploaded", done: false },
  { item: "AIS cross-checked", done: false },
  { item: "Regime selected", done: false },
  { item: "Extraction reviewed", done: false },
  { item: "Final summary approved", done: false },
];

const mistakes = [
  "Mismatched TDS between Form 16 and 26AS",
  "Missing interest income from savings account",
  "Incorrect HRA exemption calculation",
  "Choosing a regime without comparison",
  "Forgetting employer NPS contribution (80CCD(2))",
];

export default function FilingAssistantPage() {
  return (
    <AppShell>
      <div className="animate-fade-up">
        <h1 className="page-title">Filing Assistant</h1>
        <p className="page-subtitle">Step-by-step guidance to file your ITR correctly.</p>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {/* ITR form */}
          <Card className="flex flex-col items-start">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recommended ITR Form</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
                <FileText className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <p className="text-3xl font-black text-brand-700">ITR-1</p>
                <p className="text-xs text-slate-500">Sahaj</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-600 leading-6">
              For salaried individuals with income from salary, one house property, and other sources (excluding capital gains).
            </p>
            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-700">
              Verify if you have capital gains or business income — those require ITR-2 or ITR-3.
            </div>
          </Card>

          {/* Checklist */}
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
                className="h-1.5 rounded-full bg-brand-500"
                style={{ width: `${(checklist.filter(c => c.done).length / checklist.length) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate-400">
              {checklist.filter(c => c.done).length}/{checklist.length} steps completed
            </p>
          </Card>

          {/* Common mistakes */}
          <Card>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Common Mistakes to Avoid</p>
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
      </div>
    </AppShell>
  );
}
