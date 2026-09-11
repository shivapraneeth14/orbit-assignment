"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlignLeft, Calendar } from "lucide-react";
import type { Task } from "@/lib/types";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
}

const priorityColor: Record<string, string> = {
  LOW: "bg-stone-300 dark:bg-ink-subtle",
  MEDIUM: "bg-status-inprogress",
  HIGH: "bg-priority-high",
  URGENT: "bg-priority-high",
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({ id: task.id });

  // Rubber-band elasticity when other cards shuffle out of the way.
  const animation = isDragging
    ? "none"
    : "transform 250ms cubic-bezier(0.18, 0.67, 0.6, 1.22), box-shadow 150ms ease, background-color 150ms ease, border-color 150ms ease";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: animation,
  };

  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      data-task-id={task.id}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg border border-border-subtle bg-surface-raised p-3 pl-3.5 shadow-card",
        "transition-colors hover:border-border-strong hover:bg-surface-raised",
        isDragging &&
          "z-10 scale-[1.03] shadow-lift ring-2 ring-primary-ring opacity-95"
      )}
    >
      <span
        title={task.priority}
        className={cn(
          "absolute inset-y-2 left-0 w-[3px] rounded-r-full",
          priorityColor[task.priority]
        )}
      />

      <h4 className="text-sm font-medium leading-snug text-ink">{task.title}</h4>

      <div className="mt-3 flex items-center gap-3 text-ink-subtle">
        {task.description && <AlignLeft className="h-3.5 w-3.5" />}
        {task.dueDate && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              overdue && "font-medium text-priority-high"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(task.dueDate)}
          </span>
        )}
        <div className="ml-auto">
          {task.assignee && (
            <Avatar
              name={task.assignee.name}
              color={task.assignee.avatarColor}
              className="h-6 w-6 text-[10px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}