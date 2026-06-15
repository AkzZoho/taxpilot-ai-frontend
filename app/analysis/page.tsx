import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";
import { AlertTriangle, TrendingDown, TrendingUp, Wallet } from "lucide-react";

const summaryCards = [
  { label: "Gross Income", value: 1850000, icon: Wallet, color: "text-slate-700", bg: "bg-slate-50" },
  { label: "Total Deductions", value: 290000, icon: TrendingDown, color: "text-trust-700", bg: "bg-trust-50" },
  { label: "Tax Liability", value: 214000, icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50" },
  { label: "Estimated Refund", value: 18500, icon: TrendingUp, color: "text-trust-700", bg: "bg-trust-50" },
];

const deductions = [
  { section: "80C", desc: "PF + ELSS + LIC", value: 150000, used: true },
  { section: "80D", desc: "Health insurance", value: 25000, used: false },
  { section: "80CCD(1B)", desc: "NPS contribution", value: 50000, used: false },
  { section: "HRA", desc: "House rent exemption", value: 168000, used: true },
];

export default function AnalysisPage() {
  return (
    <AppShell>
      <div className="animate-fade-up">
        <h1 className="page-title">Tax Analysis</h1>
        <p className="page-subtitle">AY 2024–25 · Based on uploaded documents</p>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <div className={`mb-3 inline-flex rounded-xl p-2 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
              <p className={`mt-1 text-xl font-bold ${color}`}>{formatINR(value)}</p>
            </Card>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* Deduction breakdown */}
          <Card>
            <h2 className="text-sm font-bold text-slate-900">Deduction Breakdown</h2>
            <div className="mt-4 space-y-3">
              {deductions.map((d) => (
                <div key={d.section} className="flex items-center gap-3">
                  <span className={`w-16 rounded-lg px-2 py-1 text-center text-xs font-bold ${d.used ? "bg-trust-50 text-trust-700" : "bg-amber-50 text-amber-700"}`}>
                    {d.section}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">{d.desc}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900">{formatINR(d.value)}</p>
                  <span className={`text-xs font-medium ${d.used ? "text-trust-600" : "text-amber-600"}`}>
                    {d.used ? "Applied" : "Unused"}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Risk warnings */}
          <Card>
            <h2 className="text-sm font-bold text-slate-900">Risk Warnings</h2>
            <div className="mt-4 space-y-3">
              {[
                { msg: "AIS not uploaded — interest income may be missing.", high: true },
                { msg: "NPS deduction not verified against employer records.", high: false },
                { msg: "HRA exemption requires rent receipts for full claim.", high: false },
              ].map((w, i) => (
                <div key={i} className={`flex gap-2.5 rounded-xl p-3 ${w.high ? "bg-rose-50 border border-rose-100" : "bg-amber-50 border border-amber-100"}`}>
                  <AlertTriangle className={`h-4 w-4 shrink-0 mt-0.5 ${w.high ? "text-rose-500" : "text-amber-500"}`} />
                  <p className={`text-xs leading-5 ${w.high ? "text-rose-700" : "text-amber-700"}`}>{w.msg}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
