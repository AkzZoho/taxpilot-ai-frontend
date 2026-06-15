"use client";

import { UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function UploadWidget() {
  return (
    <Card className="border-dashed text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <UploadCloud className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-xl font-bold">Upload tax documents</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
        Add Form 16, AIS, Form 26AS, or salary slips. PDF, JPG, and PNG are supported.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <Button>Choose files</Button>
        <Button variant="secondary">Drag and drop</Button>
      </div>
      <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Processing status</p>
        <div className="mt-3 h-2 rounded-full bg-slate-200">
          <div className="h-2 w-2/3 rounded-full bg-brand-600" />
        </div>
        <p className="mt-2">Extracting salary, TDS, deductions, and source references...</p>
      </div>
    </Card>
  );
}
