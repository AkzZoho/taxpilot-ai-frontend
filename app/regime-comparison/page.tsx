"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RegimeComparisonTable } from "@/components/tax/regime-comparison-table";
import { FlowProgress } from "@/components/ui/flow-progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { ArrowRight, Check } from "lucide-react";

const regimes = [
  {
    regime: "Old Regime",
    tax: 242000,
    recommended: false,
    pros: ["Higher deductions (80C, HRA, NPS)", "Beneficial if deductions > ₹3.75L"],
  },
  {
    regime: "New Regime",
    tax: 214000,
    recommended: true,
    pros: ["Lower slab rates", "No deduction tracking needed", `Saves ${formatINR(28000)} vs old`],
  },
];

export default function RegimeComparisonPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  function handleChoose() {
    setConfirming(true);
    setTimeout(() => router.push("/filing-assistant"), 800);
  }

  return (
    <AppShell>
      <div className="animate-fade-up">
        <FlowProgress />

        <h1 className="page-title">Regime Comparison</h1>
        <p className="page-subtitle">Choose the regime that saves you more tax this year.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {regimes.map((r) => (
            <button
              key={r.regime}
              onClick={() => setSelected(r.regime)}
              className={`rounded-2xl border-2 p-5 text-left transition-all ${
                selected === r.regime
                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                  : "border-slate-200 bg-white hover:border-brand-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{r.regime}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatINR(r.tax)}</p>
                  <p className="text-xs text-slate-400">Estimated tax liability</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {r.recommended && (
                    <span className="rounded-full bg-trust-50 px-2.5 py-1 text-xs font-semibold text-trust-700">Recommended</span>
                  )}
                  {selected === r.regime && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600">
                      <Check className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              </div>
              <ul className="mt-4 space-y-1.5">
                {r.pros.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="h-3 w-3 text-trust-500 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {selected ? `You selected: ${selected}` : "Select a regime to continue"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {selected
                ? "Proceed to your personalised filing checklist."
                : "Click on either card above to choose."}
            </p>
          </div>
          <Button size="lg" disabled={!selected || confirming} onClick={handleChoose} className="shrink-0">
            {confirming ? "Loading…" : <>Continue to Filing <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>

        <div className="mt-6">
          <RegimeComparisonTable />
        </div>
      </div>
    </AppShell>
  );
}
