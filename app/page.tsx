import Link from "next/link";
import { ArrowRight, CheckCircle2, MessageCircle, Upload, IndianRupee, ShieldCheck, TrendingDown, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="bg-white text-slate-900 overflow-x-hidden">

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient">
              <span className="text-sm font-black text-white">T</span>
            </div>
            <span className="text-lg font-black text-slate-900">TaxPilot AI</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">Login</Link>
            <Link href="/signup"><Button size="sm">Get Started Free</Button></Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 mb-6">
          <BadgeCheck className="h-3.5 w-3.5" />
          Built for first-time filers and anyone who finds taxes confusing
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-950 leading-tight">
          Finally understand<br />
          <span className="text-transparent bg-clip-text bg-brand-gradient">your taxes.</span>
        </h1>
        <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto leading-8">
          Upload your Form 16. TaxPilot AI reads it, explains every number in plain English, tells you if you're getting a refund, and shows you exactly how to save more tax.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup">
            <Button size="lg" className="gap-2 text-base px-8">
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-base px-8">
              I already have an account
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">No CA required. No tax knowledge needed. Free to use.</p>
      </section>

      {/* Social proof strip */}
      <div className="border-y border-slate-100 bg-slate-50 py-4">
        <div className="mx-auto max-w-6xl px-5 flex flex-wrap justify-center gap-6 text-sm text-slate-500 font-medium">
          {["Works with scanned Form 16 PDFs", "Supports FY 2025-26 (AY 2026-27)", "Old & New regime comparison", "Zero tax up to ₹13.75L (Budget 2025)"].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-trust-500 shrink-0" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Problem → Solution */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-600 mb-3">Sound familiar?</p>
            <h2 className="text-4xl font-black text-slate-900 leading-tight">
              "I have no idea what half my Form 16 means."
            </h2>
            <div className="mt-6 space-y-4">
              {[
                "You get your Form 16 every year but don't know what to do with it",
                "You're not sure if you should pick old or new tax regime",
                "You've been paying tax but don't know if you're overpaying",
                "CA fees are high and you feel like you should be able to do this yourself",
              ].map(p => (
                <div key={p} className="flex gap-3 text-slate-600">
                  <span className="mt-1 h-2 w-2 rounded-full bg-slate-300 shrink-0" />
                  <p className="text-base leading-relaxed">{p}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl border-2 border-trust-200 bg-trust-50 p-5">
              <p className="font-bold text-trust-800">TaxPilot AI was built for exactly this.</p>
              <p className="mt-1 text-sm text-trust-700">Upload your Form 16. In minutes, you'll know exactly what your tax situation is — and what to do about it.</p>
            </div>
          </div>

          {/* Chat preview mockup */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient font-black text-white text-base shadow-sm">
                  A
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-trust-500 border-2 border-slate-50" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Arjun · TaxPilot Advisor</p>
                <p className="text-xs text-slate-400">Senior CA · 20+ years experience</p>
              </div>
            </div>
            {[
              { from: "ai",  text: "Hey! I've gone through your Form 16. Good news — you're actually getting a refund of ₹6,318. Your employer deducted a bit more TDS than needed. 🎉" },
              { from: "user", text: "Wait, I'm getting money back? How?" },
              { from: "ai",  text: "Yes! Your total tax this year is ₹2,58,849. But your company already paid ₹2,65,167 on your behalf throughout the year (this is called TDS). So the government owes you the difference." },
              { from: "user", text: "Can I save more tax next year?" },
              { from: "ai",  text: "Absolutely. You haven't maxed out your 80C limit. If you invest ₹1,50,000 in an ELSS mutual fund or PPF, you could save ₹46,800 more in tax. Want me to explain how?" },
            ].map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.from === "user"
                    ? "bg-brand-600 text-white rounded-tr-sm"
                    : "bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-50 border-y border-slate-100 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900">How it works</h2>
            <p className="mt-2 text-slate-500">Three steps. No tax knowledge needed.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Upload,         step: "1", title: "Upload your Form 16", body: "Drag and drop your Form 16 PDF — even scanned or photo copies work. TaxPilot AI reads it automatically." },
              { icon: IndianRupee,    step: "2", title: "See your full picture", body: "Instantly know your tax liability, TDS already paid, and whether you're getting a refund or need to pay more." },
              { icon: MessageCircle, step: "3", title: "Chat with your AI CA", body: "Ask anything — Arjun explains every number in plain English and tells you exactly how to save more tax next year." },
            ].map(({ icon: Icon, step, title, body }) => (
              <div key={step} className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Step {step}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you'll know */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-900">After 5 minutes on TaxPilot AI,<br />you'll know:</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: IndianRupee,  title: "Exactly what tax you owe",          body: "Calculated from your actual Form 16 — not a rough estimate." },
            { icon: TrendingDown, title: "Whether you're getting a refund",   body: "See if your employer over-deducted TDS and how much comes back to you." },
            { icon: ShieldCheck,  title: "Which regime saves you more",       body: "Old vs New, with exact ₹ savings. No jargon — just the better number." },
            { icon: Sparkles,     title: "Where you're losing money",         body: "Missed 80C investments, unused NPS, HRA you could claim — all spotted." },
            { icon: MessageCircle,title: "What to invest to reduce tax now",  body: "Specific fund names, amounts, and how much each will save you." },
            { icon: CheckCircle2, title: "Whether you're ready to file",      body: "A simple checklist that tells you exactly what's left before filing ITR." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <Icon className="h-5 w-5 text-brand-600 mb-3" />
              <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-3xl bg-brand-gradient p-10 sm:p-14 text-center">
          <h2 className="text-4xl font-black text-white leading-tight">
            Your taxes shouldn't be a mystery.
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
            Upload your Form 16 today. In minutes you'll know exactly what's happening with your money — and what to do about it.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-bold text-brand-700 shadow-sm hover:bg-slate-50 transition">
                Get started free <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/40">No credit card. No CA. No jargon.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-5 py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} TaxPilot AI — Helping Indians understand their taxes, one Form 16 at a time.
      </footer>

    </main>
  );
}
