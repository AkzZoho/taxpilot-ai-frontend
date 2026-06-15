import { AppShell } from "@/components/layout/app-shell";
import { FieldReviewCard } from "@/components/tax/field-review-card";
import { extractedFields } from "@/lib/mock-tax-data";

export default function ReviewPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-black">Extraction Review</h1>
      <p className="mt-2 max-w-2xl text-slate-600">Verify every extracted value. Each number shows its source, confidence, and explanation.</p>
      <div className="mt-6 space-y-4">
        {extractedFields.map((field) => <FieldReviewCard key={field.id} field={field} />)}
      </div>
    </AppShell>
  );
}
