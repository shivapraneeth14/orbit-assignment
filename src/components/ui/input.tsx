"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-lg border border-border-subtle bg-surface-raised px-3 text-sm text-ink shadow-[0_1px_2px_rgb(0_0_0/0.03)]",
          "placeholder:text-ink-subtle",
          "transition-all duration-150",
          "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring",
          "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border-subtle bg-surface-raised px-3 py-2 text-sm text-ink shadow-[0_1px_2px_rgb(0_0_0/0.03)]",
        "placeholder:text-ink-subtle resize-none",
        "transition-all duration-150",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Input, Textarea };