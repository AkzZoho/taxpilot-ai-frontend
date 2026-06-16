"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Upload", href: "/upload" },
  { label: "Review", href: "/review" },
  { label: "Compare", href: "/regime-comparison" },
  { label: "File", href: "/filing-assistant" },
];

export function FlowProgress() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => pathname === s.href);
  if (currentIndex === -1) return null;

  return (
    <div className="mb-6 flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={step.href} className="flex items-center">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
              done ? "bg-trust-600 text-white" :
              active ? "bg-brand-600 text-white ring-4 ring-brand-100" :
              "bg-slate-100 text-slate-400"
            )}>
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </div>
            <span className={cn(
              "ml-1.5 mr-1 text-xs font-semibold hidden sm:block",
              active ? "text-brand-700" : done ? "text-trust-600" : "text-slate-400"
            )}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "mx-2 h-px w-8 sm:w-12 rounded-full",
                i < currentIndex ? "bg-trust-400" : "bg-slate-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
