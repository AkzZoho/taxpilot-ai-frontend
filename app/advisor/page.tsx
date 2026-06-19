"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Send, Loader2, User, AlertTriangle, BadgeCheck, BookOpen, FileUp } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type TaxData = Record<string, number | string>;

const SUGGESTIONS = [
  "Which tax regime saves me more money?",
  "How can I reduce my tax before March 31?",
  "What should I invest in to save tax?",
  "Explain my HRA exemption",
  "Am I missing any deductions?",
  "What is 80CCD(1B) and should I use it?",
];

// Minimum messages before we save a summary
const MIN_MESSAGES_TO_SUMMARIZE = 4;

function formatMessage(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;

    const formatted = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.+?)`/g, "<code class='bg-slate-100 text-brand-700 px-1 rounded text-xs font-mono'>$1</code>");

    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ");
    const isHeading = line.trim().startsWith("**") && line.trim().endsWith("**");

    if (isHeading) {
      return (
        <p key={i} className="mt-3 mb-1 font-bold text-slate-900 text-sm"
          dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    }
    if (isBullet) {
      return (
        <div key={i} className="flex gap-2 ml-2 text-sm text-slate-700">
          <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-brand-400" />
          <span dangerouslySetInnerHTML={{ __html: formatted.replace(/^[-•]\s*/, "") }} />
        </div>
      );
    }
    return (
      <p key={i} className="text-sm text-slate-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatted }} />
    );
  });
}

export default function AdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [taxData, setTaxData] = useState<TaxData | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");
  const [summarySaved, setSummarySaved] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    loadTaxDataAndGreet();
    // Save summary when user leaves the page
    return () => {
      if (messagesRef.current.length >= MIN_MESSAGES_TO_SUMMARIZE) {
        saveSummary(messagesRef.current);
      }
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Keep ref in sync so the cleanup closure always has latest messages
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  async function saveSummary(msgs: Message[]) {
    if (msgs.length < MIN_MESSAGES_TO_SUMMARIZE) return;
    try {
      await fetch("/api/advisor-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: msgs.map((m) => ({ role: m.role, content: m.content })) }),
      });
      setSummarySaved(true);
    } catch {
      // Silent fail — summary is non-critical
    }
  }

  async function loadTaxDataAndGreet() {
    const supabase = createClient();
    const { data: fields } = await supabase
      .from("extracted_fields")
      .select("id, label, value");

    let data: TaxData | null = null;
    if (fields && fields.length > 0) {
      data = {};
      for (const f of fields) {
        data[f.label] = f.value;
      }
      setTaxData(data);
    }

    setInitializing(false);

    if (data) {
      await sendMessage(
        "Hello! I've just loaded my tax data. Please analyze it and tell me my tax situation, which regime is better for me, and what I can do to save more tax.",
        data,
        true
      );
    }
  }

  async function sendMessage(text: string, data?: TaxData | null, isSystem = false) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const newMessages = isSystem ? [] : [...messages, userMsg];

    if (!isSystem) {
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
    }

    setLoading(true);
    setError("");

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    try {
      const apiMessages = [
        ...newMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: text },
      ];

      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          taxData: data !== undefined ? data : taxData,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Advisor failed");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => m.id === assistantId ? { ...m, content: full } : m)
        );
      }

      // Auto-save summary every 6 messages
      const updatedMessages = [...newMessages, userMsg, { id: assistantId, role: "assistant" as const, content: full }];
      if (updatedMessages.length > 0 && updatedMessages.length % 6 === 0) {
        saveSummary(updatedMessages);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId));
    }

    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleSend() { sendMessage(input); }
  function handleSuggestion(s: string) { sendMessage(s); }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-5rem)] max-w-3xl mx-auto">
        {/* Header — Arjun identity */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient shadow-sm">
              <span className="text-lg font-black text-white">A</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-trust-500 border-2 border-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-slate-900">Arjun</h1>
              <BadgeCheck className="h-4 w-4 text-brand-600 shrink-0" />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-slate-500">Senior CA · 20+ yrs experience</p>
              <span className="hidden sm:flex items-center gap-1 text-xs text-trust-600 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-trust-500" />
                Online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {summarySaved && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400 font-medium">
                <BookOpen className="h-3 w-3" />
                Session saved
              </span>
            )}
            {taxData && (
              <span className="flex items-center gap-1.5 rounded-full bg-trust-50 border border-trust-100 px-2.5 py-1 text-xs font-semibold text-trust-700">
                <span className="h-1.5 w-1.5 rounded-full bg-trust-500" />
                Form 16 loaded
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {initializing && (
            <div className="flex justify-center mt-10">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your tax data…
              </div>
            </div>
          )}

          {!initializing && !taxData && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-12 text-center px-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient shadow-sm mb-4">
                <span className="text-2xl font-black text-white">A</span>
              </div>
              <p className="font-bold text-slate-900">Hey, I&apos;m Arjun — your tax advisor.</p>
              <p className="mt-2 text-sm text-slate-500 max-w-sm leading-relaxed">
                I need your Form 16 to analyse your tax situation. Upload it first and I&apos;ll tell you exactly what you owe, what you&apos;re getting back, and how to save more.
              </p>
              <a href="/upload" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition">
                <FileUp className="h-4 w-4" /> Upload Form 16
              </a>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-sm mt-0.5 font-black text-white text-sm">
                  A
                </div>
              )}

              <div className={cn("max-w-[85%] flex flex-col", msg.role === "assistant" && "items-start")}>
                {msg.role === "assistant" && (
                  <span className="text-[10px] font-semibold text-slate-400 mb-1 ml-1">Arjun</span>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 space-y-1",
                    msg.role === "user"
                      ? "bg-brand-600 text-white rounded-tr-sm"
                      : "bg-white border border-slate-100 shadow-soft rounded-tl-sm"
                  )}
                >
                  {msg.role === "user" ? (
                    <p className="text-sm text-white">{msg.content}</p>
                  ) : msg.content ? (
                    <div className="space-y-1">{formatMessage(msg.content)}</div>
                  ) : (
                    <div className="flex items-center gap-1.5 px-1 py-1.5">
                      <span className="h-2 w-2 rounded-full bg-brand-300 animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce [animation-delay:300ms]" />
                    </div>
                  )}
                </div>
              </div>

              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 mt-0.5">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm text-rose-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && !loading && taxData && (
          <div className="py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Ask Arjun</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestion(s)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-100 pt-3 pb-1">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-soft focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 transition">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask Arjun anything…  e.g. How do I save ₹1 lakh in tax?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              disabled={loading || initializing}
              className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
                input.trim() && !loading
                  ? "bg-brand-600 text-white hover:bg-brand-700 cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">
            Arjun&apos;s advice is AI-generated based on your Form 16 data and for guidance only. Consult a CA for final decisions.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
