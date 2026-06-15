import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition-shadow hover:shadow-card",
        className
      )}
      {...props}
    />
  );
}
