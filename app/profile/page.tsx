"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Mail, Phone, User, FileText } from "lucide-react";

interface Profile {
  full_name: string | null;
  mobile: string | null;
  pan: string | null;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "", mobile: "", pan: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      const p: Profile = {
        full_name: data?.full_name ?? user.user_metadata?.full_name ?? null,
        mobile: data?.mobile ?? user.user_metadata?.mobile ?? null,
        pan: data?.pan ?? null,
        email: user.email ?? "",
      };
      setProfile(p);
      setForm({ full_name: p.full_name ?? "", mobile: p.mobile ?? "", pan: p.pan ?? "" });
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({ id: user.id, ...form });
      setProfile((p) => p ? { ...p, ...form } : p);
    }
    setSaving(false);
    setEditing(false);
  }

  return (
    <AppShell>
      <div className="animate-fade-up">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your personal information and tax preferences.</p>

        <div className="mt-6 max-w-xl">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 font-bold text-lg">
                  {profile?.full_name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{profile?.full_name ?? "—"}</p>
                  <p className="text-xs text-slate-400">{profile?.email}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setEditing(!editing)}>
                {editing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="space-y-4">
              <Field icon={User} label="Full Name" value={editing ? form.full_name : profile?.full_name ?? "—"} editing={editing} onChange={v => setForm(f => ({ ...f, full_name: v }))} />
              <Field icon={Mail} label="Email" value={profile?.email ?? "—"} editing={false} />
              <Field icon={Phone} label="Mobile" value={editing ? form.mobile : profile?.mobile ?? "—"} editing={editing} onChange={v => setForm(f => ({ ...f, mobile: v }))} />
              <Field icon={FileText} label="PAN Number" value={editing ? form.pan : profile?.pan ?? "—"} editing={editing} onChange={v => setForm(f => ({ ...f, pan: v.toUpperCase() }))} />
            </div>

            {editing && (
              <Button className="mt-5 w-full" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
            )}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ icon: Icon, label, value, editing, onChange }: {
  icon: React.ElementType; label: string; value: string; editing: boolean; onChange?: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50">
        <Icon className="h-3.5 w-3.5 text-slate-500" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-400">{label}</p>
        {editing && onChange ? (
          <input
            value={value}
            onChange={e => onChange(e.target.value)}
            className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        ) : (
          <p className="mt-0.5 text-sm font-medium text-slate-800">{value || "—"}</p>
        )}
      </div>
    </div>
  );
}
