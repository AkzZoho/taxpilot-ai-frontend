import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AuthPage() {
  const isSignup = "login" === "signup";
  return (
    <main className="grid min-h-screen place-items-center px-4">
      <Card className="w-full max-w-md">
        <Link href="/" className="text-2xl font-black">TaxPilot AI</Link>
        <h1 className="mt-8 text-3xl font-black">{isSignup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-slate-600">Secure access to your tax workspace.</p>
        <form className="mt-6 space-y-4">
          {isSignup && <Input label="Name" />}
          <Input label="Email" type="email" />
          {isSignup && <Input label="Mobile Number" />}
          <Input label="Password" type="password" />
          <Button className="w-full">{isSignup ? "Sign Up" : "Login"}</Button>
        </form>
      </Card>
    </main>
  );
}

function Input({ label, type = "text" }: { label: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input type={type} className="focus-ring mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3" />
    </label>
  );
}
