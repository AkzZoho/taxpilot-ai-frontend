import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({ className, variant = "primary", size = "md", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm active:scale-[.98]",
    secondary: "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-sm active:scale-[.98]",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:scale-[.98]",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs rounded-lg",
    md: "h-10 px-4 text-sm rounded-xl",
    lg: "h-11 px-6 text-sm rounded-xl",
  };

  return (
    <button
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
