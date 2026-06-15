"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, mobile } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f7fe] px-6">
        <div className="text-center animate-fade-up">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-trust-50">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Account created!</h2>
          <p className="mt-1 text-sm text-slate-500">Redirecting to your dashboard…</p>
        </div>
      </div>
    );
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
            File smarter.<br />Save more.
          </p>
          <p className="mt-4 text-base leading-7 text-white/70">
            Join thousands of Indians who understand their taxes for the first time — with AI that shows its work.
          </p>
          <div className="mt-10 rounded-2xl bg-white/10 p-5">
            <p className="text-sm font-semibold text-white/50 uppercase tracking-wide">Free forever includes</p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              <li>Document upload & extraction</li>
              <li>Old vs New regime comparison</li>
              <li>Every number explained</li>
              <li>Filing checklist</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-white/30">© {new Date().getFullYear()} TaxPilot AI</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#f4f7fe] px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Free access to your tax workspace.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSignup}>
            <Field icon={User} label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Akshay Kumar" />
            <Field icon={Mail} label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <Field icon={Phone} label="Mobile Number" type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+91 98765 43210" />
            <Field icon={Lock} label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" />

            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <Button className="w-full" size="lg" disabled={loading}>
              {loading ? "Creating account…" : <>Get started free <ArrowRight className="h-4 w-4" /></>}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
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
