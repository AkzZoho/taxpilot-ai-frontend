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
}

const lockedActions = [
  { label: "Review Extraction", href: "/review", icon: ShieldCheck, desc: "Verify extracted values" },
  { label: "Compare Regimes", href: "/regime-comparison", icon: Scale, desc: "Old vs New regime" },
  { label: "Tax Advisor", href: "/advisor", icon: Sparkles, desc: "AI-powered tax tips" },
  { label: "Filing Assistant", href: "/filing-assistant", icon: Bot, desc: "ITR form guidance" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ docCount: 0, userName: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { count } = await supabase
        .from("tax_documents")
        .select("*", { count: "exact", head: true });
      setStats({
        docCount: count ?? 0,
        userName: user?.user_metadata?.full_name?.split(" ")[0] ?? "there",
      });
      setLoading(false);
    }
    load();
  }, []);

  const hasDocuments = stats.docCount > 0;

  return (
    <AppShell>
      <div className="animate-fade-up">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">
              {loading ? "Dashboard" : `Hey, ${stats.userName}`}
            </h1>
            <p className="page-subtitle">AY 2024–25 · Your tax overview</p>
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
            value={hasDocuments ? formatINR(214000) : "—"}
            sub="New regime estimate"
            accent="rose"
            icon={<TrendingDown className="h-4 w-4 text-trust-600" />}
          />
          <StatCard
            label="Potential Refund"
            value={hasDocuments ? formatINR(18500) : "—"}
            sub="After TDS adjustment"
            accent="green"
            icon={<TrendingUp className="h-4 w-4 text-trust-600" />}
          />
          <StatCard
            label="Health Score"
            value={hasDocuments ? "85/100" : "—"}
            sub={hasDocuments ? "Strong" : "Upload to compute"}
            accent="blue"
          />
        </div>

        {/* Summary + actions row */}
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {/* Tax summary */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Tax Summary</h2>
              <span className="rounded-full bg-trust-50 px-3 py-1 text-xs font-semibold text-trust-700">
                New regime recommended
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Gross Salary", value: 1850000, highlight: false },
                { label: "Standard Deduction", value: 75000, highlight: false },
                { label: "Estimated Tax Liability", value: 214000, highlight: true },
                { label: "TDS Already Deducted", value: 186500, highlight: false },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">{row.label}</span>
                  <span className={row.highlight ? "font-bold text-brand-700" : "font-medium text-slate-900"}>
                    {hasDocuments ? formatINR(row.value) : "—"}
                  </span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">Estimated Refund</span>
                <span className="font-bold text-trust-600">{hasDocuments ? formatINR(18500) : "—"}</span>
              </div>
            </div>
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
