"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/dashboard/count-up";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  alert?: boolean;
}

export function StatCard({ icon, label, value, alert }: StatCardProps) {
  const reduceMotion = useReducedMotion();
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-4 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-pop motion-reduce:hover:translate-y-0">
      <div className="flex items-center gap-2 text-ink-subtle">{icon}</div>
      <p
        className={cn(
          "mt-3 text-2xl font-bold tracking-tight",
          alert ? "text-priority-high" : "text-ink"
        )}
      >
        <CountUp value={value} duration={reduceMotion ? 0 : 700} />
      </p>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
        {label}
      </p>
    </div>
  );
}