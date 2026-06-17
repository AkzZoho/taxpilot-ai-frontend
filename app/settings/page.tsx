"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Lock, Shield, Trash2, X, AlertTriangle, Loader2, CheckCircle2, FileText, MessageSquare, Database } from "lucide-react";

type Modal = "security" | "privacy" | "delete" | null;
type LoadingKey = "reset" | "signout" | "chat" | "documents" | "fields" | "all" | "delete" | null;

export default function SettingsPage() {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [loadingKey, setLoadingKey] = useState<LoadingKey>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [toast, setToast] = useState("");

  function closeModal() {
    setModal(null);
    setDeleteConfirm("");
    setLoadingKey(null);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  async function sendPasswordReset() {
    setLoadingKey("reset");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      showToast("Password reset email sent — check your inbox.");
    }
    setLoadingKey(null);
    closeModal();
  }

  async function signOutOtherSessions() {
    setLoadingKey("signout");
    const supabase = createClient();
    // scope: "others" signs out all other sessions, keeps current one alive
    await supabase.auth.signOut({ scope: "others" });
    setLoadingKey(null);
    closeModal();
    showToast("All other devices have been signed out. You are still logged in here.");
  }

  async function clearData(type: "all" | "chat" | "documents" | "fields") {
    setLoadingKey(type);
    const supabase = createClient();
    if (type === "chat" || type === "all") {
      await supabase.from("tax_analyses").update({ advisor_notes: null }).neq("id", "");
    }
    if (type === "documents" || type === "all") {
      const { data: docs } = await supabase.from("tax_documents").select("storage_path");
      if (docs?.length) {
        await supabase.storage.from("tax-documents").remove(docs.map((d) => d.storage_path));
      }
      await supabase.from("tax_documents").delete().neq("id", "");
    }
    if (type === "fields" || type === "all") {
      await supabase.from("extracted_fields").delete().neq("id", "");
    }
    setLoadingKey(null);
    const labels: Record<string, string> = {
      chat: "AI Chat Summary deleted.",
      documents: "Uploaded documents deleted.",
      fields: "Extracted tax values deleted.",
      all: "All your data has been deleted.",
    };
    showToast(labels[type]);
    closeModal();
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setLoadingKey("delete");
    const supabase = createClient();
    const { data: docs } = await supabase.from("tax_documents").select("storage_path");
    if (docs?.length) {
      await supabase.storage.from("tax-documents").remove(docs.map((d) => d.storage_path));
    }
    await supabase.from("tax_documents").delete().neq("id", "");
    await supabase.from("extracted_fields").delete().neq("id", "");
    await supabase.from("tax_analyses").delete().neq("id", "");
    await supabase.auth.signOut();
    router.push("/");
  }

  const busy = (key: LoadingKey) => loadingKey === key;

  return (
    <AppShell>
      <div className="animate-fade-up">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, security, and data.</p>

        <div className="mt-6 max-w-xl space-y-3">
          <Card className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
              <Lock className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Security</p>
              <p className="text-xs text-slate-400 leading-5">Reset your password or sign out all other active sessions.</p>
            </div>
            <button
              onClick={() => setModal("security")}
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
              <p className="text-xs text-slate-400 leading-5">View what is stored and delete your data anytime.</p>
            </div>
            <button
              onClick={() => setModal("privacy")}
              className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Review
            </button>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50">
              <Trash2 className="h-4 w-4 text-rose-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-rose-700">Delete Account</p>
              <p className="text-xs text-slate-400 leading-5">Permanently delete your account and all associated data.</p>
            </div>
            <button
              onClick={() => setModal("delete")}
              className="shrink-0 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
            >
              Delete
            </button>
          </Card>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg flex items-center gap-2 animate-fade-up">
          <CheckCircle2 className="h-4 w-4 text-trust-400 shrink-0" />
          {toast}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

          {/* Security Modal */}
          {modal === "security" && (
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-900">Security</h2>
                <button onClick={closeModal}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-800">Reset Password</p>
                  <p className="mt-0.5 text-xs text-slate-500">A password reset link will be sent to your registered email address.</p>
                  <button
                    onClick={sendPasswordReset}
                    disabled={loadingKey !== null}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition disabled:opacity-50"
                  >
                    {busy("reset") ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending…</> : "Send Reset Email"}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-800">Sign Out Other Devices</p>
                  <p className="mt-0.5 text-xs text-slate-500">Signs out all other devices and browsers. Your current session stays active.</p>
                  <button
                    onClick={signOutOtherSessions}
                    disabled={loadingKey !== null}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    {busy("signout") ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Signing out…</> : "Sign Out Other Devices"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Modal */}
          {modal === "privacy" && (
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-900">Data & Privacy</h2>
                <button onClick={closeModal}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <p className="text-xs text-slate-500 mb-4">TaxPilot stores the following data. You can delete any category independently.</p>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-brand-500" />
                    <p className="text-sm font-semibold text-slate-800">Uploaded Documents</p>
                  </div>
                  <p className="text-xs text-slate-500">Your Form 16 and other tax documents stored in secure cloud storage.</p>
                  <button
                    onClick={() => clearData("documents")}
                    disabled={loadingKey !== null}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    {busy("documents") ? <><Loader2 className="h-3 w-3 animate-spin" /> Deleting…</> : "Delete Documents"}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Database className="h-4 w-4 text-brand-500" />
                    <p className="text-sm font-semibold text-slate-800">Extracted Tax Values</p>
                  </div>
                  <p className="text-xs text-slate-500">Gross salary, TDS, HRA, deductions and other values extracted from your Form 16.</p>
                  <button
                    onClick={() => clearData("fields")}
                    disabled={loadingKey !== null}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    {busy("fields") ? <><Loader2 className="h-3 w-3 animate-spin" /> Deleting…</> : "Delete Extracted Data"}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-brand-500" />
                    <p className="text-sm font-semibold text-slate-800">AI Chat Summary</p>
                  </div>
                  <p className="text-xs text-slate-500">A summary of your Tax Advisor conversations, saved to personalise future advice.</p>
                  <button
                    onClick={() => clearData("chat")}
                    disabled={loadingKey !== null}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    {busy("chat") ? <><Loader2 className="h-3 w-3 animate-spin" /> Deleting…</> : "Delete Chat Summary"}
                  </button>
                </div>

                <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                  <p className="text-sm font-semibold text-rose-800">Delete All My Data</p>
                  <p className="text-xs text-rose-700 mt-0.5">Removes all documents, extracted values, and chat history. Your account stays active.</p>
                  <button
                    onClick={() => clearData("all")}
                    disabled={loadingKey !== null}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
                  >
                    {busy("all") ? <><Loader2 className="h-3 w-3 animate-spin" /> Deleting…</> : "Delete All My Data"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Account Modal */}
          {modal === "delete" && (
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                </div>
                <button onClick={closeModal}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <h2 className="text-base font-bold text-slate-900">Delete your account?</h2>
              <p className="mt-1 text-sm text-slate-500">
                This permanently deletes your account along with all uploaded documents, extracted values, and AI chat history. This cannot be undone.
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
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== "DELETE" || loadingKey !== null}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:opacity-40"
                >
                  {busy("delete") ? <><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</> : "Delete Account"}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </AppShell>
  );
}
