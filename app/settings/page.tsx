import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Bell, Lock, Shield, Trash2 } from "lucide-react";

const sections = [
  {
    icon: Bell,
    title: "Notifications",
    desc: "Email alerts for filing deadlines, regime changes, and document expiry.",
    action: "Configure",
  },
  {
    icon: Lock,
    title: "Security",
    desc: "Manage your password, active sessions, and two-factor authentication.",
    action: "Manage",
  },
  {
    icon: Shield,
    title: "Data & Privacy",
    desc: "Control what data is stored. Download or delete your tax records anytime.",
    action: "Review",
  },
  {
    icon: Trash2,
    title: "Delete Account",
    desc: "Permanently delete your account and all associated documents.",
    action: "Delete",
    danger: true,
  },
];

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="animate-fade-up">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account, privacy, and notifications.</p>

        <div className="mt-6 max-w-xl space-y-3">
          {sections.map(({ icon: Icon, title, desc, action, danger }) => (
            <Card key={title} className="flex items-center gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-rose-50" : "bg-slate-50"}`}>
                <Icon className={`h-4 w-4 ${danger ? "text-rose-500" : "text-slate-500"}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${danger ? "text-rose-700" : "text-slate-900"}`}>{title}</p>
                <p className="text-xs text-slate-400 leading-5">{desc}</p>
              </div>
              <button className={`shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${danger ? "border-rose-200 text-rose-600 hover:bg-rose-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {action}
              </button>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
