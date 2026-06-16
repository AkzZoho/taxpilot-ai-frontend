"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, CheckCircle2, FileText, Loader2,
  Sparkles, Trash2, UploadCloud, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type DocType = "Form 16" | "AIS" | "Form 26AS" | "Salary Slip";
type Stage = "idle" | "uploading" | "extracting" | "ready";

interface UploadedDoc {
  id: string;
  name: string;
  type: DocType;
  status: "uploading" | "done" | "error";
  created_at: string;
}

const DOC_TYPES: DocType[] = ["Form 16", "AIS", "Form 26AS", "Salary Slip"];

const EXTRACTION_STEPS = [
  "Reading document structure…",
  "Identifying salary components…",
  "Extracting TDS entries…",
  "Matching deductions…",
  "Cross-referencing source data…",
  "Extraction complete!",
];

export function UploadWidget() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [docType, setDocType] = useState<DocType>("Form 16");
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [stage, setStage] = useState<Stage>("idle");
  const [extractStep, setExtractStep] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    loadDocs();
  }, []);

  async function loadDocs() {
    const supabase = createClient();
    const { data } = await supabase
      .from("tax_documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setDocs(data as UploadedDoc[]);
      if (data.length > 0) setStage("ready");
    }
  }

  async function simulateExtraction() {
    setStage("extracting");
    for (let i = 0; i < EXTRACTION_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setExtractStep(i);
    }
    await new Promise((r) => setTimeout(r, 500));
    setStage("ready");
  }

  async function uploadFile(file: File) {
    if (!userId) return;
    setStage("uploading");
    const supabase = createClient();
    const path = `${userId}/${Date.now()}-${file.name}`;

    const tempDoc: UploadedDoc = {
      id: path,
      name: file.name,
      type: docType,
      status: "uploading",
      created_at: new Date().toISOString(),
    };
    setDocs((prev) => [tempDoc, ...prev]);

    const { error: storageError } = await supabase.storage
      .from("tax-documents")
      .upload(path, file, { upsert: true });

    if (storageError) {
      setDocs((prev) => prev.map((d) => d.id === path ? { ...d, status: "error" } : d));
      setStage("idle");
      return;
    }

    const { data: inserted } = await supabase
      .from("tax_documents")
      .insert({ user_id: userId, name: file.name, type: docType, storage_path: path, status: "done" })
      .select()
      .single();

    setDocs((prev) => prev.map((d) =>
      d.id === path ? { ...(inserted as UploadedDoc), status: "done" } : d
    ));

    await simulateExtraction();
  }

  async function deleteDoc(doc: UploadedDoc) {
    const supabase = createClient();
    if (doc.status === "done") {
      await supabase.from("tax_documents").delete().eq("id", doc.id);
    }
    const remaining = docs.filter((d) => d.id !== doc.id);
    setDocs(remaining);
    if (remaining.length === 0) setStage("idle");
  }

  const onFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    uploadFile(files[0]);
  }, [userId, docType]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onFiles(e.dataTransfer.files);
  }, [onFiles]);

  // Extraction animation screen
  if (stage === "extracting") {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
          <Sparkles className="h-7 w-7 text-brand-600 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-slate-900">AI is reading your {docType}</h3>
        <p className="mt-1 text-sm text-slate-500">Extracting and verifying every number…</p>
        <div className="mt-8 w-full max-w-sm space-y-2.5">
          {EXTRACTION_STEPS.map((step, i) => (
            <div
              key={step}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-all",
                i < extractStep ? "bg-trust-50 text-trust-700" :
                i === extractStep ? "bg-brand-50 text-brand-700 font-medium" :
                "text-slate-300"
              )}
            >
              {i < extractStep
                ? <CheckCircle2 className="h-4 w-4 shrink-0 text-trust-500" />
                : i === extractStep
                ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-500" />
                : <div className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-200" />
              }
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Post-upload "ready" state
  if (stage === "ready") {
    const form16 = docs.find((d) => d.type === "Form 16");
    return (
      <div className="space-y-5">
        {/* Success banner */}
        <div className="rounded-2xl bg-trust-50 border border-trust-100 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-trust-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-bold text-trust-800">
                {form16 ? "Form 16 uploaded & extracted" : "Documents uploaded"}
              </p>
              <p className="mt-0.5 text-xs text-trust-700">
                {form16
                  ? "5 fields extracted — salary, TDS, HRA, PF, NPS. Ready for your review."
                  : `${docs.length} document${docs.length > 1 ? "s" : ""} uploaded successfully.`}
              </p>
            </div>
          </div>
          <Button
            className="mt-4 w-full"
            onClick={() => router.push("/review")}
          >
            Review extracted data <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Uploaded docs list */}
        <div>
          <p className="mb-3 text-sm font-semibold text-slate-700">Uploaded documents ({docs.length})</p>
          <div className="space-y-2">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-soft"
              >
                <FileText className="h-5 w-5 shrink-0 text-brand-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{doc.name}</p>
                  <p className="text-xs text-slate-400">{doc.type}</p>
                </div>
                {doc.status === "done" && <CheckCircle2 className="h-4 w-4 text-trust-600" />}
                {doc.status === "error" && <XCircle className="h-4 w-4 text-rose-500" />}
                <button
                  onClick={() => deleteDoc(doc)}
                  className="ml-1 rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add more */}
        <button
          onClick={() => { setStage("idle"); }}
          className="text-sm text-brand-600 hover:underline font-medium"
        >
          + Add another document
        </button>
      </div>
    );
  }

  // Default upload UI
  return (
    <div className="space-y-5">
      {/* Doc type selector */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">What are you uploading?</p>
        <div className="flex flex-wrap gap-2">
          {DOC_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setDocType(t)}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-medium transition",
                docType === t
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all",
          dragging
            ? "border-brand-500 bg-brand-50"
            : "border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50/40"
        )}
      >
        {stage === "uploading"
          ? <Loader2 className="mx-auto h-8 w-8 animate-spin text-brand-500" />
          : <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
        }
        <p className="mt-3 text-sm font-semibold text-slate-800">
          {stage === "uploading" ? "Uploading…" : dragging ? "Drop your file here" : "Click to upload or drag & drop"}
        </p>
        <p className="mt-1 text-xs text-slate-400">PDF, JPG, PNG — up to 25 MB</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => onFiles(e.target.files)}
          disabled={stage === "uploading"}
        />
      </div>
    </div>
  );
}
