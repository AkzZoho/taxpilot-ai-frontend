import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";

const cards = [
  ["Income Summary", formatINR(1850000), "Gross salary plus other reported income."],
  ["Deductions", formatINR(290000), "Eligible deductions under old regime."],
  ["Tax Liability", formatINR(214000), "Estimated under recommended regime."],
  ["Refund Estimate", formatINR(18500), "Subject to final filing validation."]
];

export default function AnalysisPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-black">Tax Analysis</h1>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([title, value, body]) => <Card key={title}><p className="text-sm font-semibold text-slate-500">{title}</p><p className="mt-2 text-2xl font-black">{value}</p><p className="mt-2 text-sm text-slate-600">{body}</p></Card>)}
      </div>
      <Card className="mt-6"><h2 className="text-xl font-bold">Risk Warnings</h2><p className="mt-3 text-sm text-slate-600">AIS interest income not uploaded yet. Add AIS to reduce mismatch risk.</p></Card>
    </AppShell>
  );
}
