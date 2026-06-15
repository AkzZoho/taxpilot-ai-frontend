import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const styles = {
    primary: "bg-brand-600 text-white hover:bg-brand-700",
    secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100"
  };

  return (
    <button
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
