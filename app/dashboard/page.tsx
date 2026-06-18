"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Bot, FileUp, Scale, ShieldCheck, Sparkles,
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Lock,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatINR } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Stats {
  docCount: number;
  userName: string;
  grossSalary: number;
  tds: number;
  standardDeduction: number;
  taxLiability: number;
  refund: number;
  hasFields: boolean;
  taxFromForm16: boolean;
}

function computeTax(income: number): number {
  if (income <= 0) return 0;
  // FY 2025-26 / AY 2026-27 new regime slabs (Budget 2025)
  const slabs: [number, number][] = [
    [400000, 0], [400000, 0.05], [400000, 0.10],
    [400000, 0.15], [400000, 0.20], [400000, 0.25], [Infinity, 0.30],
  ];
  let tax = 0, rem = income;
  for (const [limit, rate] of slabs) {
    const chunk = Math.min(rem, limit);
    tax += chunk * rate;
    rem -= chunk;
    if (rem <= 0) break;
  }
  // 87A rebate: zero tax if taxable income ≤ ₹12L (Budget 2025)
  if (income <= 1200000) tax = 0;
  return Math.round(tax * 1.04);
}

const lockedActions = [
  { label: "Review Extraction", href: "/review", icon: ShieldCheck, desc: "Verify extracted values" },
  { label: "Compare Regimes", href: "/regime-comparison", icon: Scale, desc: "Old vs New regime" },
  { label: "Tax Advisor", href: "/advisor", icon: Sparkles, desc: "AI-powered tax tips" },
  { label: "Filing Assistant", href: "/filing-assistant", icon: Bot, desc: "ITR form guidance" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    docCount: 0, userName: "", grossSalary: 0, tds: 0,
    standardDeduction: 0, taxLiability: 0, refund: 0, hasFields: false, taxFromForm16: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const [{ count }, { data: fields }] = await Promise.all([
        supabase.from("tax_documents").select("*", { count: "exact", head: true }),
        supabase.from("extracted_fields").select("id, value"),
      ]);

      const f: Record<string, number> = {};
      (fields ?? []).forEach((r) => { f[r.id] = Number(r.value); });
      const hasFields = Object.keys(f).length > 0;

      const grossSalary = f["gross-salary"] ?? 0;
      const tds = f["tds"] ?? 0;
      const standardDeduction = 75000;
      // Prefer Form 16's own computed tax figure; fall back to our slab estimate
      const taxLiability = f["tax-after-cess"] > 0
        ? f["tax-after-cess"]
        : computeTax(Math.max(0, grossSalary - standardDeduction));
      // Prefer Form 16's explicit refund; fall back to derived
      const refund = f["tax-refundable"] > 0
        ? f["tax-refundable"]
        : Math.max(0, tds - taxLiability);

      setStats({
        docCount: count ?? 0,
        userName: user?.user_metadata?.full_name?.split(" ")[0] ?? "there",
        grossSalary, tds, standardDeduction, taxLiability, refund, hasFields,
        taxFromForm16: (f["tax-after-cess"] ?? 0) > 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const hasDocuments = stats.docCount > 0;
  const { hasFields, grossSalary, tds, standardDeduction, taxLiability, refund, taxFromForm16 } = stats;

  return (
    <AppShell>
      <div className="animate-fade-up">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">
              {loading ? "Dashboard" : `Hey, ${stats.userName}`}
            </h1>
            <p className="page-subtitle">AY 2026–27 (FY 2025–26) · Your tax overview</p>
          </div>
          <Link href="/upload">
            <Button size="sm">
              <FileUp className="h-3.5 w-3.5" /> Upload docs
            </Button>
          </Link>
        </div>

        {/* Stat cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Documents"
            value={String(stats.docCount)}
            sub={stats.docCount === 0 ? "None uploaded yet" : "Uploaded"}
            accent="blue"
          />
          <StatCard
            label="Tax Liability"
            value={hasFields ? formatINR(taxLiability) : "—"}
            sub={hasFields ? (taxFromForm16 ? "From Form 16" : "New regime estimate") : "Upload Form 16"}
            accent="rose"
            icon={hasFields ? <TrendingDown className="h-4 w-4 text-trust-600" /> : undefined}
          />
          <StatCard
            label={refund > 0 ? "Refund Due" : "Balance Tax"}
            value={hasFields ? formatINR(refund) : "—"}
            sub={hasFields ? (taxFromForm16 ? "As per Form 16" : "Estimated after TDS") : "Upload Form 16"}
            accent="green"
            icon={hasFields ? <TrendingUp className="h-4 w-4 text-trust-600" /> : undefined}
          />
          <StatCard
            label="Gross Salary"
            value={hasFields ? formatINR(grossSalary) : "—"}
            sub={hasFields ? "From Form 16" : "Upload to compute"}
            accent="blue"
          />
        </div>

        {/* Summary + actions row */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {/* Tax summary */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Tax Summary</h2>
              {hasFields && (
                <span className="rounded-full bg-trust-50 px-3 py-1 text-xs font-semibold text-trust-700">
                  New regime estimate
                </span>
              )}
            </div>
            {!hasFields ? (
              <p className="mt-4 text-sm text-slate-400">Upload and review your Form 16 to see your tax summary.</p>
            ) : (
              <div className="mt-5 space-y-3">
                {[
                  { label: "Gross Salary", value: grossSalary },
                  { label: "Standard Deduction (auto)", value: standardDeduction },
                  { label: taxFromForm16 ? "Tax Liability (Form 16)" : "Tax Liability (estimate)", value: taxLiability, highlight: true },
                  { label: "TDS Paid by Employer", value: tds },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{row.label}</span>
                    <span className={row.highlight ? "font-bold text-brand-700" : "font-medium text-slate-900"}>
                      {formatINR(row.value)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">
                    {refund > 0 ? "Refund — Government owes you" : "Balance tax to pay"}
                  </span>
                  <span className={`font-bold ${refund > 0 ? "text-trust-600" : "text-amber-600"}`}>
                    {formatINR(refund)}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Filing checklist */}
          <Card>
            <h2 className="text-base font-bold text-slate-900">Filing Checklist</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: "Form 16 uploaded", done: hasDocuments },
                { label: "AIS cross-checked", done: false },
                { label: "Regime selected", done: false },
                { label: "Values reviewed", done: false },
                { label: "Filing ready", done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-sm">
                  {item.done
                    ? <CheckCircle2 className="h-4 w-4 text-trust-600 shrink-0" />
                    : <div className="h-4 w-4 rounded-full border-2 border-slate-200 shrink-0" />
                  }
                  <span className={item.done ? "text-slate-800 font-medium" : "text-slate-400"}>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Upload CTA or Action Grid */}
        <div className="mt-6">
          {!hasDocuments && !loading ? (
            /* Upload prompt — no Form 16 yet */
            <div className="rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 p-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 mb-4">
                  <FileUp className="h-6 w-6 text-brand-600" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Upload Form 16 to get started</h2>
                <p className="mt-1 text-sm text-slate-500 max-w-sm">
                  Review, Compare, Advisor, and Filing unlock automatically once your Form 16 is uploaded.
                </p>
                <Link href="/upload" className="mt-5">
                  <Button>
                    Upload Form 16 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Locked previews */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {lockedActions.map((action) => (
                  <div
                    key={action.href}
                    className="relative rounded-2xl border border-slate-100 bg-white/60 p-4 opacity-50 select-none"
                  >
                    <div className="flex items-center justify-between">
                      <action.icon className="h-5 w-5 text-slate-400" />
                      <Lock className="h-3.5 w-3.5 text-slate-300" />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-500">{action.label}</p>
                    <p className="mt-0.5 text-xs text-slate-300">{action.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : hasDocuments ? (
            /* Unlocked actions */
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-base font-bold text-slate-900">Quick Actions</h2>
                <span className="flex items-center gap-1 rounded-full bg-trust-50 border border-trust-100 px-2.5 py-0.5 text-xs font-semibold text-trust-700">
                  <CheckCircle2 className="h-3 w-3" /> Form 16 uploaded
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {lockedActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div className={cn(
                      "group rounded-2xl border bg-white p-4 shadow-soft transition hover:shadow-card cursor-pointer",
                      action.href === "/advisor"
                        ? "border-brand-200 bg-brand-50/30 hover:border-brand-400"
                        : "border-slate-100 hover:border-brand-200"
                    )}>
                      <action.icon className={cn(
                        "h-5 w-5 transition group-hover:scale-110",
                        action.href === "/advisor" ? "text-brand-600" : "text-brand-500"
                      )} />
                      <p className="mt-3 text-sm font-semibold text-slate-800">{action.label}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{action.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Always show upload button at bottom when docs exist */}
        {hasDocuments && (
          <div className="mt-4 flex justify-end">
            <Link href="/upload">
              <Button variant="secondary" size="sm">
                <FileUp className="h-3.5 w-3.5" /> Add another document
              </Button>
            </Link>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: string; sub: string;
  accent: "blue" | "green" | "rose";
  icon?: React.ReactNode;
}) {
  const accents = {
    blue: "text-brand-700",
    green: "text-trust-700",
    rose: "text-rose-600",
  };
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className={`text-2xl font-bold ${accents[accent]}`}>{value}</p>
        {icon}
      </div>
      <p className="mt-1 text-xs text-slate-400">{sub}</p>
    </Card>
  );
}
