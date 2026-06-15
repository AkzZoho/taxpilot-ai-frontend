import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils";

export function TaxSummaryCard() {
  return (
    <Card>
      <p className="text-sm font-semibold text-slate-500">Estimated refund</p>
      <p className="mt-2 text-4xl font-bold text-trust-700">{formatINR(18500)}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Based on Form 16, AIS, and 26AS. Review every extracted value before filing.
      </p>
    </Card>
  );
}
