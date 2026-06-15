import type { Confidence } from "@/types/tax";
import { cn } from "@/lib/utils";

export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const styles = {
    high: "bg-trust-50 text-trust-700 ring-trust-100",
    medium: "bg-amber-50 text-amber-700 ring-amber-100",
    low: "bg-rose-50 text-rose-700 ring-rose-100"
  };

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", styles[confidence])}>
      {confidence[0].toUpperCase() + confidence.slice(1)} confidence
    </span>
  );
}
