"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import type { ExtractedField } from "@/types/tax";

export function ExplainNumberDrawer({ field }: { field: ExtractedField }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" className="gap-2 px-3" onClick={() => setOpen(true)} aria-label={`Explain ${field.label}`}>
        <HelpCircle className="h-4 w-4" /> Why?
      </Button>

      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${field.label} explanation`}>
          <button className="absolute inset-0 bg-slate-950/35" aria-label="Close explanation drawer" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-brand-600">Explain Every Number</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">{field.label}</h2>
              </div>
              <button className="focus-ring rounded-full p-2 hover:bg-slate-100" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 rounded-3xl bg-brand-50 p-5">
              <p className="text-sm text-slate-600">Extracted value</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">{formatINR(field.value)}</p>
            </div>

            <div className="mt-6 space-y-5">
              <Info label="Source document" value={field.source} />
              <Info label="Formula used" value={field.formula ?? "No formula available"} />
              <Info label="Plain-English explanation" value={field.explanation} />
              <Info label="What you should verify" value="Check whether this value matches your uploaded document and edit it if needed before filing." />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-base leading-7 text-slate-900">{value}</p>
    </div>
  );
}
