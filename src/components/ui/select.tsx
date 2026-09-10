"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  className?: string;
  placeholder?: string;
}

export function Select({ value, onChange, options, className, placeholder }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-full items-center justify-between gap-2 rounded-lg border border-border-subtle bg-surface-raised px-2.5 text-sm text-ink transition-all duration-150 hover:bg-ink/5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-ring"
      >
        <span className={cn(!selected && "text-ink-subtle")}>
          {selected ? selected.label : placeholder ?? "Select"}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-ink-subtle transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-1 w-full min-w-[140px] overflow-hidden rounded-lg border border-border-subtle bg-surface-raised py-1 shadow-pop animate-in fade-in zoom-in-95 duration-100"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              disabled={opt.disabled}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center px-3 py-1.5 text-left text-sm transition-colors hover:bg-ink/5",
                opt.value === value ? "bg-primary-soft text-primary" : "text-ink-muted",
                opt.disabled && "opacity-40 pointer-events-none"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}