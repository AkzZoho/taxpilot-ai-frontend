import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export default function FilingAssistantPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-black">Filing Assistant</h1>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card><h2 className="text-xl font-bold">Recommended ITR Form</h2><p className="mt-3 text-3xl font-black text-brand-700">ITR-1</p><p className="mt-2 text-sm text-slate-600">For salaried income with basic sources. Verify if capital gains or business income exists.</p></Card>
        <Card><h2 className="text-xl font-bold">Filing Checklist</h2><ul className="mt-4 space-y-3 text-sm text-slate-700"><li>Form 16 uploaded</li><li>26AS uploaded</li><li>AIS pending</li><li>Regime selected</li><li>Final review pending</li></ul></Card>
        <Card><h2 className="text-xl font-bold">Common Mistakes</h2><p className="mt-3 text-sm text-slate-600">Mismatched TDS, missed interest income, incorrect HRA, and choosing a regime without comparison.</p></Card>
        <Card><h2 className="text-xl font-bold">Final Review</h2><p className="mt-3 text-sm text-slate-600">TaxPilot will summarize all source fields before you proceed to filing.</p></Card>
      </div>
    </AppShell>
  );
}
