"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Bot, FileUp, LayoutDashboard, LogOut, Scale, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const nav = [
  ["Dashboard", "/dashboard", LayoutDashboard],
  ["Upload", "/upload", FileUp],
  ["Review", "/review", ShieldCheck],
  ["Compare", "/regime-comparison", Scale],
  ["Filing", "/filing-assistant", Bot],
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-slate-200 bg-white p-5 lg:flex lg:flex-col">
        <Link href="/" className="text-2xl font-black text-slate-950">TaxPilot AI</Link>
        <nav className="mt-8 flex-1 space-y-2" aria-label="Main navigation">
          {nav.map(([label, href, Icon]) => (
            <Link
              key={href}
              href={href}
              className="focus-ring flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>
      <main className="p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
