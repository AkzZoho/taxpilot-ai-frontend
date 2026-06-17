"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Bell, Lock, Shield, Trash2, X, AlertTriangle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("tax_documents").delete().neq("id", "");
    await supabase.from("extracted_fields").delete().neq("id", "");
    await supabase.from("tax_analyses").delete().neq("id", "");
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <AppShell>
      <div className="animate-fade-up">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, privacy, and notifications.</p>

        <div className="mt-6 max-w-xl space-y-3">
          <Card className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
              <Bell className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <p className="text-xs text-slate-400 leading-5">Email alerts for filing deadlines and document expiry.</p>
            </div>
            <span className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-50">
              Coming soon
            </span>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
              <Lock className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Security</p>
              <p className="text-xs text-slate-400 leading-5">Manage your password and active sessions.</p>
            </div>
            <button
              onClick={() => router.push("/profile")}
              className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Manage
            </button>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
              <Shield className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Data & Privacy</p>
              <p className="text-xs text-slate-400 leading-5">Your tax data is stored securely and never shared.</p>
            </div>
            <span className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-50">
              Coming soon
            </span>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50">
              <Trash2 className="h-4 w-4 text-rose-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700">Delete Account</p>
              <p className="text-xs text-slate-400 leading-5">Permanently delete your account and all tax documents.</p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              Delete
            </button>
          </Card>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              </div>
              <button onClick={() => setShowDeleteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h2 className="text-base font-bold text-slate-900">Delete your account?</h2>
            <p className="mt-1 text-sm text-slate-500">
              This will permanently delete all your documents, extracted values, and tax analyses. This cannot be undone.
            </p>
            <div className="mt-4">
              <label className="text-xs font-semibold text-slate-700">Type DELETE to confirm</label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE" || deleting}
                className="flex-1 rounded-xl bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:opacity-40"
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
