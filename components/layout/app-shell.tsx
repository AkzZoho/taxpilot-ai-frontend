"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import {
  Bot, ChevronRight, FileUp, LayoutDashboard, LogOut,
  Menu, Scale, Settings, ShieldCheck, Sparkles, User, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload", href: "/upload", icon: FileUp },
  { label: "Review", href: "/review", icon: ShieldCheck },
  { label: "Compare", href: "/regime-comparison", icon: Scale },
  { label: "Tax Advisor", href: "/advisor", icon: Sparkles },
  { label: "Filing", href: "/filing-assistant", icon: Bot },
];

const bottomNav = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
];

function NavItem({ href, icon: Icon, label, active, onClick }: {
  href: string; icon: React.ElementType; label: string; active: boolean; onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`sidebar-item ${active ? "sidebar-item-active" : "sidebar-item-inactive"}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {active && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-brand-gradient px-3 py-5">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-2 pb-6 pt-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <span className="text-sm font-black text-white">T</span>
        </div>
        <span className="text-base font-bold text-white tracking-tight">TaxPilot AI</span>
      </div>

      {/* Main nav */}
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">Menu</p>
      <nav className="space-y-0.5">
        {nav.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname === item.href}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      <div className="my-4 border-t border-white/10" />

      {/* Bottom nav */}
      <nav className="space-y-0.5">
        {bottomNav.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={pathname === item.href}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      <div className="mt-auto pt-4">
        <button
          onClick={handleLogout}
          className="sidebar-item sidebar-item-inactive w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-[var(--sidebar-w,268px)] shrink-0 lg:block">
        <div className="sticky top-0 h-screen overflow-y-auto">
          {sidebar}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="focus-ring rounded-lg p-1.5 hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-bold text-slate-900">TaxPilot AI</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
