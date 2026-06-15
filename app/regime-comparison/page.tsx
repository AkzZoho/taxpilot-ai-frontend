import { AppShell } from "@/components/layout/app-shell";
import { RegimeComparisonTable } from "@/components/tax/regime-comparison-table";

export default function RegimeComparisonPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-black">Regime Comparison</h1>
      <p className="mt-2 text-slate-600">Compare old and new tax regimes with clear assumptions.</p>
      <div className="mt-6"><RegimeComparisonTable /></div>
    </AppShell>
  );
}
