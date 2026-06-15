import Link from "next/link";
import { ReactNode } from "react";
import { Bot, FileUp, LayoutDashboard, Scale, ShieldCheck } from "lucide-react";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Upload", "/upload", FileUp],
  ["Review", "/review", ShieldCheck],
  ["Compare", "/regime-comparison", Scale],
  ["Filing", "/filing-assistant", Bot]
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-slate-200 bg-white p-5 lg:block">
        <Link href="/" className="text-2xl font-black text-slate-950">TaxPilot AI</Link>
        <nav className="mt-8 space-y-2" aria-label="Main navigation">
          {nav.map(([label, href, Icon]) => (
            <Link key={href} href={href} className="focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700">
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
