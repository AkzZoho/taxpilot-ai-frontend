"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Trash2, UploadCloud, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type DocType = "Form 16" | "AIS" | "Form 26AS" | "Salary Slip";

interface UploadedDoc {
  id: string;
  name: string;
  type: DocType;
  status: "uploading" | "done" | "error";
  created_at: string;
}

const DOC_TYPES: DocType[] = ["Form 16", "AIS", "Form 26AS", "Salary Slip"];

export function UploadWidget() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [docType, setDocType] = useState<DocType>("Form 16");
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [uploading, setUploading] = useState(false);
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
    if (data) setDocs(data as UploadedDoc[]);
  }

  async function uploadFile(file: File) {
    if (!userId) return;
    setUploading(true);
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
      setUploading(false);
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
    setUploading(false);
  }

  async function deleteDoc(doc: UploadedDoc) {
    const supabase = createClient();
    if (doc.status === "done") {
      await supabase.from("tax_documents").delete().eq("id", doc.id);
    }
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  }

  const onFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach(uploadFile);
  }, [userId, docType]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onFiles(e.dataTransfer.files);
  }, [onFiles]);

  return (
    <div className="space-y-5">
      {/* Doc type selector */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Document type</p>
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
          "cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all",
          dragging
            ? "border-brand-500 bg-brand-50"
            : "border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50/40"
        )}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
          <UploadCloud className="h-6 w-6 text-brand-600" />
        </div>
        <p className="text-sm font-semibold text-slate-800">
          {dragging ? "Drop your file here" : "Click to upload or drag & drop"}
        </p>
        <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG — up to 25 MB</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {uploading && (
        <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading to secure storage…
        </div>
      )}

      {/* Uploaded docs list */}
      {docs.length > 0 && (
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
                {doc.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-brand-500" />}
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
      )}

      {docs.length === 0 && !uploading && (
        <p className="text-center text-sm text-slate-400">No documents uploaded yet.</p>
      )}
    </div>
  );
}
