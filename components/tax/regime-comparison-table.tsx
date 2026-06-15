import { regimeRows } from "@/lib/mock-tax-data";
import { formatINR } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function RegimeComparisonTable() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-slate-200 p-5">
        <p className="text-sm font-semibold text-brand-600">Recommended: New Regime</p>
        <h2 className="text-2xl font-bold">Old vs New Regime</h2>
        <p className="mt-1 text-sm text-slate-600">Estimated savings: {formatINR(28000)}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="p-4">Category</th>
              <th className="p-4">Old Regime</th>
              <th className="p-4">New Regime</th>
              <th className="p-4">Explanation</th>
            </tr>
          </thead>
          <tbody>
            {regimeRows.map((row) => (
              <tr key={row.category} className="border-t border-slate-100">
                <td className="p-4 font-semibold">{row.category}</td>
                <td className="p-4">{formatINR(row.oldRegime)}</td>
                <td className="p-4 font-semibold text-brand-700">{formatINR(row.newRegime)}</td>
                <td className="p-4 text-slate-600">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
