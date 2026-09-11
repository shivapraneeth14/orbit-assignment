"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { TaskCard } from "@/components/board/task-card";

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  accent: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({
  status,
  label,
  accent,
  tasks,
  onAddTask,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      data-status={status}
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl border border-border-subtle bg-surface-muted/60 shadow-card transition-colors duration-150",
        isOver && "border-primary/50 ring-2 ring-primary-ring bg-primary-soft/40"
      )}
    >
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", accent)} />
          <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            {label}
          </span>
          <span className="rounded-md bg-ink/5 px-1.5 text-xs font-medium text-ink-subtle">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="rounded-md p-1 text-ink-subtle transition-colors hover:bg-ink/5 hover:text-ink"
          title={`Add task to ${label}`}
          aria-label={`Add task to ${label}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-3">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div
            className={cn(
              "rounded-lg border border-dashed px-3 py-6 text-center text-xs transition-colors",
              isOver
                ? "border-primary/60 bg-primary-soft/40 text-primary"
                : "border-border-strong text-ink-subtle"
            )}
          >
            {isOver ? "Release to move here" : "Drop tasks here"}
          </div>
        )}
      </div>
    </div>
  );
}