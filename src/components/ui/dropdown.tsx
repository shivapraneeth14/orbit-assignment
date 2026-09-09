"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  value?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[] | { label: string; items: DropdownItem[] }[];
  align?: "left" | "right";
  direction?: "down" | "up";
  width?: string;
}

export function Dropdown({
  trigger,
  items,
  align = "left",
  direction = "down",
  width = "w-56",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const renderItem = (item: DropdownItem, key: string) => (
    <button
      key={key}
      type="button"
      onClick={() => {
        setOpen(false);
        item.onClick?.();
      }}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-stone-50",
        item.danger ? "text-red-600" : "text-stone-700"
      )}
    >
      {item.icon}
      <span className="flex-1">{item.label}</span>
    </button>
  );

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-40 overflow-hidden rounded-lg border border-stone-200 bg-white py-1 shadow-lg",
            width,
            align === "right" ? "right-0" : "left-0",
            direction === "up" ? "bottom-full mb-2" : "mt-1"
          )}
        >
          {(
            Array.isArray(items) && items.length > 0 && !("items" in items[0])
              ? [{ label: "", items }]
              : (items as { label: string; items: DropdownItem[] }[])
          ).map((section, i) => (
            <div key={i}>
              {section.label && (
                <div className="px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                  {section.label}
                </div>
              )}
              {section.items.map((item, j) => renderItem(item, `${i}-${j}`))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
