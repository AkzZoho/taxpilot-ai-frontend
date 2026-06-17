"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FlowProgress } from "@/components/ui/flow-progress";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatINR } from "@/lib/utils";
import { ArrowRight, Check, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type Fields = Record<string, number>;

function computeTax(income: number, regime: "old" | "new"): number {
  if (income <= 0) return 0;
  let tax = 0;
  if (regime === "new") {
    const slabs = [
      [300000, 0], [400000, 0.05], [300000, 0.10],
      [200000, 0.15], [300000, 0.20], [Infinity, 0.30],
    ] as [number, number][];
    let rem = income;
    for (const [limit, rate] of slabs) {
      const chunk = Math.min(rem, limit);
      tax += chunk * rate;
      rem -= chunk;
      if (rem <= 0) break;
    }
    // New regime rebate: no tax if income ≤ 7L
    if (income <= 700000) tax = 0;
  } else {
    const slabs = [
      [250000, 0], [250000, 0.05], [500000, 0.20], [Infinity, 0.30],
    ] as [number, number][];
    let rem = income;
    for (const [limit, rate] of slabs) {
      const chunk = Math.min(rem, limit);
      tax += chunk * rate;
      rem -= chunk;
      if (rem <= 0) break;
    }
    // Old regime rebate: no tax if income ≤ 5L
    if (income <= 500000) tax = 0;
  }
  return Math.round(tax * 1.04); // add 4% cess
}

export default function RegimeComparisonPage() {
  const router = useRouter();
  const [fields, setFields] = useState<Fields | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("extracted_fields").select("id, label, value");
      if (data && data.length > 0) {
        const map: Fields = {};
        data.forEach((f) => { map[f.id] = Number(f.value); });
        setFields(map);
      }
      setLoading(false);
    }
    load();
  }, []);

  function handleChoose() {
    setConfirming(true);
    setTimeout(() => router.push("/advisor"), 800);
  }

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center gap-2 mt-20 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      </AppShell>
    );
  }

  if (!fields) {
    return (
      <AppShell>
        <FlowProgress />
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
          <AlertTriangle className="mx-auto h-9 w-9 text-amber-500 mb-3" />
          <p className="font-semibold text-amber-800">No tax data found</p>
          <p className="mt-1 text-sm text-amber-700">Upload and review your Form 16 first to see the regime comparison.</p>
          <Button className="mt-4" onClick={() => router.push("/upload")}>Go to Upload</Button>
        </div>
      </AppShell>
    );
  }

  const grossSalary = fields["gross-salary"] ?? 0;
  const standardDeductionNew = 75000;
  const standardDeductionOld = 50000;
  const hraExemption = fields["hra"] ?? 0;
  const chapterVIA = fields["chapter-via"] ?? 0;

  const taxableNew = Math.max(0, grossSalary - standardDeductionNew);
  const taxableOld = Math.max(0, grossSalary - standardDeductionOld - hraExemption - chapterVIA);

  const taxNew = computeTax(taxableNew, "new");
  const taxOld = computeTax(taxableOld, "old");
  const saving = Math.abs(taxOld - taxNew);
  const newIsBetter = taxNew <= taxOld;

  const regimes = [
    {
      key: "Old Regime",
      tax: taxOld,
      taxableIncome: taxableOld,
      recommended: !newIsBetter,
      pros: [
        `HRA exemption: ${formatINR(hraExemption)}`,
        `Chapter VI-A deductions: ${formatINR(chapterVIA)}`,
        newIsBetter ? `Costs ${formatINR(saving)} more than new regime` : `Saves ${formatINR(saving)} vs new regime`,
      ],
    },
    {
      key: "New Regime",
      tax: taxNew,
      taxableIncome: taxableNew,
      recommended: newIsBetter,
      pros: [
        "Higher standard deduction: ₹75,000",
        "Lower slab rates",
        newIsBetter ? `Saves ${formatINR(saving)} vs old regime` : `Costs ${formatINR(saving)} more than old regime`,
      ],
    },
  ];

  return (
    <AppShell>
      <div className="animate-fade-up">
        <FlowProgress />
        <h1 className="page-title">Regime Comparison</h1>
        <p className="page-subtitle">Based on your Form 16 — choose the regime that saves you more tax.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {regimes.map((r) => (
            <button
              key={r.key}
              onClick={() => setSelected(r.key)}
              className={cn(
                "rounded-2xl border-2 p-5 text-left transition-all",
                selected === r.key
                  ? "border-brand-500 bg-brand-50 ring-2 ring-brand-200"
                  : "border-slate-200 bg-white hover:border-brand-300"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{r.key}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatINR(r.tax)}</p>
                  <p className="text-xs text-slate-400">Taxable income: {formatINR(r.taxableIncome)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {r.recommended && (
                    <span className="rounded-full bg-trust-50 px-2.5 py-1 text-xs font-semibold text-trust-700">Recommended</span>
                  )}
                  {selected === r.key && (
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

        {/* Summary bar */}
        <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4 text-sm text-brand-800">
          <strong>{newIsBetter ? "New Regime" : "Old Regime"}</strong> saves you{" "}
          <strong>{formatINR(saving)}</strong> this year based on your Form 16 values.
        </div>

        {/* CTA */}
        <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900">
              {selected ? `You selected: ${selected}` : "Select a regime to continue"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {selected ? "Your Tax Advisor will use this to give personalised recommendations." : "Click on either card above to choose."}
            </p>
          </div>
          <Button size="lg" disabled={!selected || confirming} onClick={handleChoose} className="shrink-0">
            {confirming ? "Loading…" : <>Talk to Tax Advisor <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
