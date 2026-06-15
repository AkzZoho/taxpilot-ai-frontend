import { AppShell } from "@/components/layout/app-shell";
import { UploadWidget } from "@/components/tax/upload-widget";

export default function UploadPage() {
  return (
    <AppShell>
      <h1 className="text-3xl font-black">Upload Documents</h1>
      <p className="mt-2 text-slate-600">Upload Form 16, AIS, Form 26AS, or salary slips.</p>
      <div className="mt-6"><UploadWidget /></div>
    </AppShell>
  );
}
