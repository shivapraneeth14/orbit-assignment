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

const priorityDot: Record<string, string> = {
  LOW: "bg-stone-300",
  MEDIUM: "bg-amber-400",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-600",
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(task)}
      className={cn(
        "group cursor-pointer rounded-lg border border-stone-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md",
        isDragging && "z-10 shadow-lg ring-2 ring-primary/50 opacity-90"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn("mt-1 inline-block h-2 w-2 shrink-0 rounded-full", priorityDot[task.priority])}
          title={task.priority}
        />
        <h4 className="flex-1 text-sm font-medium leading-snug text-stone-800">
          {task.title}
        </h4>
      </div>

      <div className="mt-3 flex items-center gap-3 text-stone-400">
        {task.description && <AlignLeft className="h-3.5 w-3.5" />}
        {task.dueDate && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              overdue && "font-medium text-red-600"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(task.dueDate)}
          </span>
        )}
        <div className="ml-auto">
          {task.assignee && (
            <Avatar name={task.assignee.name} color={task.assignee.avatarColor} className="h-6 w-6 text-[10px]" />
          )}
        </div>
      </div>
    </div>
  );
}
