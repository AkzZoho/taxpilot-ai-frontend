import Link from "next/link";
import { ArrowRight, FileSearch, Landmark, Lightbulb, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  ["Form 16 Analysis", "Extract salary, TDS, exemptions, and deductions with source references."],
  ["Tax Regime Comparison", "See whether old or new regime is better and why."],
  ["Deduction Discovery", "Find missed 80C, NPS, HRA, medical, and home-loan opportunities."],
  ["Explain Every Number", "Open a plain-English breakdown for every tax amount."]
];

export default function LandingPage() {
  return (
    <main>
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-2xl font-black">TaxPilot AI</Link>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-semibold text-slate-700">Login</Link>
          <Link href="/signup"><Button>Get Started Free</Button></Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
            Transparent AI tax filing for India
          </p>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Upload Form 16. Understand Your Taxes Instantly.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            TaxPilot AI turns confusing tax documents into verified numbers, regime comparisons, and filing guidance — with a “Why?” button beside every amount.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/upload"><Button className="gap-2">Upload Form 16 <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/signup"><Button variant="secondary">Get Started Free</Button></Link>
          </div>
        </div>

        <Card className="relative overflow-hidden">
          <div className="absolute right-5 top-5 rounded-full bg-trust-50 px-3 py-1 text-xs font-bold text-trust-700">Secure document review</div>
          <ShieldCheck className="h-10 w-10 text-brand-600" />
          <h2 className="mt-6 text-2xl font-bold">Know exactly where every tax number comes from.</h2>
          <div className="mt-6 space-y-3">
            {["Source: Form 16 Part B", "Formula: Gross Salary - Deductions", "Confidence: High", "Plain-English explanation available"].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">{item}</div>
            ))}
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, body]) => <Card key={title}><FileSearch className="h-6 w-6 text-brand-600" /><h3 className="mt-4 font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></Card>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-3xl font-black">How it works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {["Upload", "Review", "Optimize", "File"].map((step, i) => (
            <Card key={step}><p className="text-sm font-bold text-brand-600">Step {i + 1}</p><h3 className="mt-2 text-xl font-bold">{step}</h3><p className="mt-2 text-sm text-slate-600">Clear guidance with no unexplained tax jargon.</p></Card>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
        TaxPilot AI — transparent, secure, explainable tax filing.
      </footer>
    </main>
  );
}
