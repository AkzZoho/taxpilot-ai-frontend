import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={cn("rounded-3xl border border-slate-200 bg-white p-5 shadow-soft", className)} {...props} />;
}
