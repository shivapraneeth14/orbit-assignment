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
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl bg-stone-100/70",
        isOver && "ring-2 ring-primary/40 bg-primary-soft/50"
      )}
    >
      <div className="flex items-center justify-between px-3 pb-2 pt-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", accent)} />
          <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            {label}
          </span>
          <span className="rounded-md bg-stone-200/70 px-1.5 text-xs font-medium text-stone-500">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="rounded-md p-1 text-stone-400 hover:bg-stone-200 hover:text-stone-700"
          title={`Add task to ${label}`}
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
        {tasks.length === 0 && !isOver && (
          <div className="rounded-lg border border-dashed border-stone-300 px-3 py-6 text-center text-xs text-stone-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
