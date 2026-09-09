import { cn } from "@/lib/utils";
import type { TaskPriority, TaskStatus } from "@/generated/prisma/enums";

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-stone-200/70 text-stone-600",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  IN_REVIEW: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
};

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-stone-200/70 text-stone-600",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        statusStyles[status]
      )}
    >
      {status.replace("_", " ")}
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
