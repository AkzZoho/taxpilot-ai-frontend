import { AppShell } from "@/components/layout/app-shell";
import { RegimeComparisonTable } from "@/components/tax/regime-comparison-table";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { Check } from "lucide-react";

export default function RegimeComparisonPage() {
  return (
    <AppShell>
      <div className="animate-fade-up">
        <h1 className="page-title">Regime Comparison</h1>
        <p className="page-subtitle">See which regime saves you more tax this year.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 mb-6">
          {[
            { regime: "Old Regime", tax: 242000, recommended: false, pros: ["Higher deductions (80C, HRA, NPS)", "Beneficial if deductions > ₹3.75L"] },
            { regime: "New Regime", tax: 214000, recommended: true, pros: ["Lower slab rates", "No deduction tracking needed", `Saves ${formatINR(28000)} vs old regime`] },
          ].map((r) => (
            <Card key={r.regime} className={r.recommended ? "border-brand-200 ring-1 ring-brand-300" : ""}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{r.regime}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatINR(r.tax)}</p>
                  <p className="text-xs text-slate-400">Estimated tax liability</p>
                </div>
                {r.recommended && (
                  <span className="rounded-full bg-trust-50 px-3 py-1 text-xs font-semibold text-trust-700">Recommended</span>
                )}
              </div>
              <ul className="mt-4 space-y-2">
                {r.pros.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="h-3.5 w-3.5 text-trust-500 shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <RegimeComparisonTable />
      </div>
    </AppShell>
  );
}
