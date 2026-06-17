"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Lock, Shield, Trash2, X, AlertTriangle, Loader2, CheckCircle2, FileText, MessageSquare, Database } from "lucide-react";

type Modal = "security" | "privacy" | "delete" | null;

export default function SettingsPage() {
  const router = useRouter();
  const [modal, setModal] = useState<Modal>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  function closeModal() {
    setModal(null);
    setDeleteConfirm("");
    setLoading(false);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function sendPasswordReset() {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      showToast("Password reset email sent. Check your inbox.");
    }
    setLoading(false);
    closeModal();
  }

  async function signOutAllSessions() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "global" });
    router.push("/login");
  }

  async function clearData(type: "all" | "chat" | "documents" | "fields") {
    setLoading(true);
    const supabase = createClient();
    if (type === "chat" || type === "all") {
      await supabase.from("tax_analyses").update({ advisor_notes: null }).neq("id", "");
    }
    if (type === "documents" || type === "all") {
      // Get storage paths first
      const { data: docs } = await supabase.from("tax_documents").select("storage_path");
      if (docs?.length) {
        await supabase.storage.from("tax-documents").remove(docs.map((d) => d.storage_path));
      }
      await supabase.from("tax_documents").delete().neq("id", "");
    }
    if (type === "fields" || type === "all") {
      await supabase.from("extracted_fields").delete().neq("id", "");
    }
    setLoading(false);
    showToast("Data deleted successfully.");
    closeModal();
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setLoading(true);
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

  return (
    <AppShell>
      <div className="animate-fade-up">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, security, and data.</p>

        <div className="mt-6 max-w-xl space-y-3">
          {/* Security */}
          <Card className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
              <Lock className="h-4 w-4 text-slate-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Security</p>
              <p className="text-xs text-slate-400 leading-5">Reset your password or sign out all active sessions.</p>
            </div>
            <button
              onClick={() => setModal("security")}
              className="shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Manage
            </button>
          </Card>

          {/* Data & Privacy */}
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

          {/* Delete Account */}
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-trust-400" />
          {toast}
        </div>
      )}

      {/* Backdrop */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

          {/* ── Security Modal ── */}
          {modal === "security" && (
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-slate-900">Security</h2>
                <button onClick={closeModal}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-800">Reset Password</p>
                  <p className="mt-0.5 text-xs text-slate-500">We will send a password reset link to your registered email address.</p>
                  <button
                    onClick={sendPasswordReset}
                    disabled={loading}
                    className="mt-3 rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Send Reset Email"}
                  </button>
                </div>
                <div className="rounded-xl border border-slate-100 p-4">
                  <p className="text-sm font-semibold text-slate-800">Sign Out All Sessions</p>
                  <p className="mt-0.5 text-xs text-slate-500">Signs you out from all devices including this one.</p>
                  <button
                    onClick={signOutAllSessions}
                    disabled={loading}
                    className="mt-3 rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Sign Out All Devices"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Privacy Modal ── */}
          {modal === "privacy" && (
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-base font-bold text-slate-900">Data & Privacy</h2>
                <button onClick={closeModal}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <p className="text-xs text-slate-500 mb-4">TaxPilot stores the following data for your account. You can delete any of it at any time.</p>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-4 w-4 text-brand-500" />
                    <p className="text-sm font-semibold text-slate-800">Uploaded Documents</p>
                  </div>
                  <p className="text-xs text-slate-500">Your Form 16 and other tax documents stored in secure cloud storage.</p>
                  <button
                    onClick={() => clearData("documents")}
                    disabled={loading}
                    className="mt-3 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete Documents"}
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
                    disabled={loading}
                    className="mt-3 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete Extracted Data"}
                  </button>
                </div>

                <div className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-4 w-4 text-brand-500" />
                    <p className="text-sm font-semibold text-slate-800">AI Chat Summary</p>
                  </div>
                  <p className="text-xs text-slate-500">A summary of your Tax Advisor conversations saved to personalise future advice.</p>
                  <button
                    onClick={() => clearData("chat")}
                    disabled={loading}
                    className="mt-3 rounded-xl border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete Chat Summary"}
                  </button>
                </div>

                <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
                  <p className="text-sm font-semibold text-rose-800">Delete All Data</p>
                  <p className="text-xs text-rose-700 mt-0.5">Removes all documents, extracted values, and chat history. Your account remains active.</p>
                  <button
                    onClick={() => clearData("all")}
                    disabled={loading}
                    className="mt-3 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
                  >
                    {loading ? "Deleting..." : "Delete All My Data"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Delete Account Modal ── */}
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
                  disabled={deleteConfirm !== "DELETE" || loading}
                  className="flex-1 rounded-xl bg-rose-600 py-2 text-sm font-semibold text-white hover:bg-rose-700 transition disabled:opacity-40"
                >
                  {loading ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </AppShell>
  );
}
