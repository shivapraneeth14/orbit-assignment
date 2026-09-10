"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ProjectCardProps {
  projectId: string;
  name: string;
  color: string;
  doneCount: number;
  totalCount: number;
  progress: number;
}

export function ProjectCard({
  projectId,
  name,
  color,
  doneCount,
  totalCount,
  progress,
}: ProjectCardProps) {
  return (
    <Link
      href={`/project/${projectId}`}
      className="group block rounded-xl border border-border-subtle bg-surface-raised p-3 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-pop motion-reduce:hover:translate-y-0"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {name}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-ink-subtle transition-transform group-hover:translate-x-0.5 motion-reduce:group-hover:translate-x-0" />
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-ink-subtle">
        <span>{doneCount}/{totalCount} done</span>
        <span>{progress}%</span>
      </div>
    </Link>
  );
}