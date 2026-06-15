"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Please confirm your email before logging in, or ask your admin to disable email confirmation for testing.");
      } else {
        setError(error.message);
      }
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-[46%] flex-col justify-between bg-brand-gradient p-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <span className="text-sm font-black text-white">T</span>
          </div>
          <span className="text-lg font-bold text-white">TaxPilot AI</span>
        </div>
        <div>
          <p className="text-5xl font-black leading-tight text-white">
            Your taxes,<br />explained.
          </p>
          <p className="mt-4 text-base leading-7 text-white/70">
            Upload Form 16. Get a clear breakdown of every tax number — with source, formula, and plain-English explanation.
          </p>
          <div className="mt-8 space-y-3">
            {["Sourced from Form 16 & AIS", "Old vs New regime comparison", "Every number explained"].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-trust-500 shrink-0" />
                <span className="text-sm text-white/80">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/30">© {new Date().getFullYear()} TaxPilot AI</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f4f7fe] px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <span className="text-xl font-black">TaxPilot AI</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your tax workspace.</p>

          <form className="mt-8 space-y-4" onSubmit={handleLogin}>
            <Field icon={Mail} label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <Field icon={Lock} label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in…" : <>Sign in <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            No account?{" "}
            <Link href="/signup" className="font-semibold text-brand-600 hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type = "text", value, onChange, placeholder }: {
  icon: React.ElementType; label: string; type?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 transition"
        />
      </div>
    </div>
  );
}
