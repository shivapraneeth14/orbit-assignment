"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[0_1px_2px_rgb(0_0_0/0.18)] hover:bg-primary-hover hover:shadow-glow focus-visible:ring-primary-ring",
  secondary:
    "bg-primary-soft text-primary hover:bg-primary/15 focus-visible:ring-primary-ring",
  ghost: "text-ink-muted hover:bg-ink/5 hover:text-ink",
  danger:
    "bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-300 dark:bg-priority-high-soft dark:text-priority-high dark:hover:bg-priority-high/30",
  outline:
    "border border-border-subtle bg-surface-raised text-ink-muted hover:bg-ink/5 hover:text-ink focus-visible:ring-border-strong",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-10 px-5 text-sm gap-2",
  icon: "h-8 w-8",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
          "active:scale-[0.98] motion-reduce:active:scale-100",
          "disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps };