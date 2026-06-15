import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { UploadWidget } from "@/components/tax/upload-widget";
import { FileText, Info, Lock } from "lucide-react";

const docGuide = [
  { name: "Form 16", desc: "From your employer — salary, TDS, deductions." },
  { name: "Form 26AS", desc: "From IT portal — all TDS entries by PAN." },
  { name: "AIS", desc: "Annual Information Statement — interest, dividends." },
  { name: "Salary Slip", desc: "For manual verification of allowances." },
];

export default function UploadPage() {
  return (
    <AppShell>
      <div className="animate-fade-up">
        <h1 className="page-title">Upload Documents</h1>
        <p className="page-subtitle">Securely upload your tax documents for AI extraction.</p>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_280px]">
          <Card>
            <UploadWidget />
          </Card>

          <div className="space-y-4">
            <Card>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Info className="h-4 w-4 text-brand-500" />
                Document guide
              </div>
              <div className="mt-4 space-y-3">
                {docGuide.map((d) => (
                  <div key={d.name}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-brand-500 shrink-0" />
                      <p className="text-sm font-semibold text-slate-800">{d.name}</p>
                    </div>
                    <p className="mt-0.5 pl-5 text-xs text-slate-500">{d.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="rounded-2xl border border-trust-100 bg-trust-50 p-4 flex gap-2.5">
              <Lock className="h-4 w-4 text-trust-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-trust-700">End-to-end secure</p>
                <p className="mt-1 text-xs text-trust-600 leading-5">
                  Documents are encrypted at rest. Only you can access them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
