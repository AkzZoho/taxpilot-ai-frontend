"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Upload", href: "/upload" },
  { label: "Review", href: "/review" },
  { label: "Compare", href: "/regime-comparison" },
  { label: "Advisor", href: "/advisor" },
  { label: "File", href: "/filing-assistant" },
];

export function FlowProgress() {
  const pathname = usePathname();
  const currentIndex = STEPS.findIndex((s) => pathname === s.href);
  if (currentIndex === -1) return null;

  return (
    <div className="mb-6 flex items-center gap-0">
      {STEPS.map((step, i) => {
        const active = i === currentIndex;
        const past = i < currentIndex;
        return (
          <div key={step.href} className="flex items-center">
            <div className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all",
              active ? "bg-brand-600 text-white ring-4 ring-brand-100" :
              past  ? "bg-slate-200 text-slate-500" :
                      "bg-slate-100 text-slate-400"
            )}>
              {i + 1}
            </div>
            <span className={cn(
              "ml-1.5 mr-1 text-xs font-semibold hidden sm:block",
              active ? "text-brand-700" :
              past  ? "text-slate-400" :
                      "text-slate-300"
            )}>
              {step.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "mx-2 h-px w-6 sm:w-10 rounded-full",
                past ? "bg-slate-300" : "bg-slate-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
