import { Card } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/tax/confidence-badge";
import { ExplainNumberDrawer } from "@/components/tax/explain-number-drawer";
import { formatINR } from "@/lib/utils";
import type { ExtractedField } from "@/types/tax";

export function FieldReviewCard({ field }: { field: ExtractedField }) {
  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-bold">{field.label}</h3>
          <ConfidenceBadge confidence={field.confidence} />
        </div>
        <p className="mt-1 text-sm text-slate-600">Source: {field.source}</p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <input
          aria-label={field.label}
          className="focus-ring w-40 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right font-semibold"
          defaultValue={formatINR(field.value)}
        />
        <ExplainNumberDrawer field={field} />
      </div>
    </Card>
  );
}
