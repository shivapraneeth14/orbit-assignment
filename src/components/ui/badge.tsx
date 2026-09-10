import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-status-todo-soft text-status-todo",
  IN_PROGRESS: "bg-status-inprogress-soft text-status-inprogress",
  IN_REVIEW: "bg-status-inreview-soft text-status-inreview",
  DONE: "bg-status-done-soft text-status-done",
};

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-status-todo-soft text-status-todo",
  MEDIUM: "bg-status-inprogress-soft text-status-inprogress",
  HIGH: "bg-priority-high-soft text-priority-high",
  URGENT: "bg-priority-urgent-soft text-priority-urgent",
};

const label: Record<string, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  DONE: "Done",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        statusStyles[status]
      )}
    >
      {label[status] ?? status.replace("_", " ")}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        priorityStyles[priority]
      )}
    >
      {priority}
    </span>
  );
}