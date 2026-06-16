"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FieldReviewCard } from "@/components/tax/field-review-card";
import { FlowProgress } from "@/components/ui/flow-progress";
import { Button } from "@/components/ui/button";
import { extractedFields } from "@/lib/mock-tax-data";
import { ArrowRight, Info } from "lucide-react";

export default function ReviewPage() {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);

  function handleConfirm() {
    setConfirmed(true);
    setTimeout(() => router.push("/regime-comparison"), 800);
  }

  return (
    <AppShell>
      <div className="animate-fade-up">
        <FlowProgress />

        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="page-title">Review Extraction</h1>
            <p className="page-subtitle">Verify every value before comparing regimes. Edit anything that looks wrong.</p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
          <Info className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
          <p className="text-xs text-brand-700 leading-5">
            These values were extracted from your <strong>Form 16</strong>. 
            Each shows its source, formula, and confidence level. 
            Edit any incorrect value before proceeding.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {extractedFields.map((field) => (
            <FieldReviewCard key={field.id} field={field} />
          ))}
        </div>

        {/* Confirm CTA */}
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900">All values look correct?</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirming will lock these values for regime comparison. You can still edit later.
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={confirmed}
            className="shrink-0"
          >
            {confirmed ? "Loading comparison…" : <>Confirm & Compare Regimes <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
