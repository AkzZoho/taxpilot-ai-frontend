import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { TaxSummaryCard } from "@/components/tax/tax-summary-card";

export default function DashboardPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-black">Dashboard</h1>
      <p className="mt-2 text-slate-600">Your tax health, document status, and recommended actions.</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card><p className="text-sm font-semibold text-slate-500">Tax Health Score</p><p className="mt-2 text-5xl font-black text-brand-700">85/100</p><p className="mt-3 text-sm text-slate-600">Strong, but HRA and NPS need verification.</p></Card>
        <TaxSummaryCard />
        <Card><p className="text-sm font-semibold text-slate-500">Filing Status</p><p className="mt-2 text-2xl font-bold">Review pending</p><p className="mt-3 text-sm text-slate-600">Verify extracted values before final filing guidance.</p></Card>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card><h2 className="text-xl font-bold">Recommended Actions</h2><ul className="mt-4 space-y-3 text-sm text-slate-700"><li>Verify HRA exemption</li><li>Upload AIS for interest income validation</li><li>Compare regimes before filing</li></ul></Card>
        <Card><h2 className="text-xl font-bold">Tax Savings Opportunities</h2><p className="mt-3 text-sm text-slate-600">Potential savings found through NPS and old-regime deductions.</p></Card>
      </div>
    </AppShell>
  );
}
