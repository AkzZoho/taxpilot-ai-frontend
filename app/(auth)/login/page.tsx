"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <Link href="/" className="text-2xl font-black">TaxPilot AI</Link>
        <h1 className="mt-8 text-3xl font-black">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">Secure access to your tax workspace.</p>
        <form className="mt-6 space-y-4" onSubmit={handleLogin}>
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-blue-600 hover:underline">Sign up</Link>
        </p>
      </Card>
    </main>
  );
}

function Input({
  label, type = "text", value, onChange,
}: {
  label: string; type?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required
        className="focus-ring mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3"
      />
    </label>
  );
}
