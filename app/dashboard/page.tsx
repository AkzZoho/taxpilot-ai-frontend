"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Bot, FileUp, Scale, ShieldCheck,
  TrendingDown, TrendingUp, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatINR } from "@/lib/utils";

interface Stats {
  docCount: number;
  userName: string;
}

const quickActions = [
  { label: "Upload Documents", href: "/upload", icon: FileUp, desc: "Add Form 16, AIS, 26AS" },
  { label: "Review Extraction", href: "/review", icon: ShieldCheck, desc: "Verify extracted values" },
  { label: "Compare Regimes", href: "/regime-comparison", icon: Scale, desc: "Old vs New regime" },
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

        {/* Upload prompt */}
        {!hasDocuments && !loading && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">No documents uploaded yet</p>
              <p className="mt-0.5 text-sm text-amber-700">Upload Form 16 to unlock your tax analysis, regime comparison, and filing guidance.</p>
              <Link href="/upload" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-800 hover:underline">
                Upload now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

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

          {/* Filing status */}
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

        {/* Quick actions */}
        <div className="mt-6">
          <h2 className="mb-4 text-base font-bold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="group rounded-2xl border border-slate-100 bg-white p-4 shadow-soft transition hover:border-brand-200 hover:shadow-card cursor-pointer">
                  <action.icon className="h-5 w-5 text-brand-600 transition group-hover:scale-110" />
                  <p className="mt-3 text-sm font-semibold text-slate-800">{action.label}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
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
