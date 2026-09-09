"use client";

import { useMemo, useState } from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import type { Task } from "@/lib/types";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";

type SortKey = "status" | "priority" | "dueDate" | "title" | "assignee";

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const sortableColumns: { key: SortKey; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "assignee", label: "Assignee" },
  { key: "dueDate", label: "Due date" },
];

const priorityRank: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const statusRank: Record<string, number> = {
  TODO: 0,
  IN_PROGRESS: 1,
  IN_REVIEW: 2,
  DONE: 3,
};

export function TaskListView({ tasks, onTaskClick }: TaskListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    const arr = [...tasks];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "status":
          cmp = statusRank[a.status] - statusRank[b.status];
          break;
        case "priority":
          cmp = priorityRank[a.priority] - priorityRank[b.priority];
          break;
        case "dueDate":
          cmp = (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) -
                (b.dueDate ? new Date(b.dueDate).getTime() : Infinity);
          break;
        case "assignee":
          cmp = (a.assignee?.name ?? "").localeCompare(b.assignee?.name ?? "");
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [tasks, sortKey, sortDir]);

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <div className="grid grid-cols-12 items-center gap-2 border-b border-stone-200 bg-stone-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
        {sortableColumns.map((col) => (
          <button
            key={col.key}
            onClick={() => toggleSort(col.key)}
            className={cn(
              "flex items-center gap-1 hover:text-stone-800 text-left",
              col.key === "title" && "col-span-4",
              col.key === "status" && "col-span-2",
              col.key === "priority" && "col-span-2",
              col.key === "assignee" && "col-span-2",
              col.key === "dueDate" && "col-span-2",
              sortKey === col.key && "text-primary"
            )}
          >
            {col.label}
            {sortKey === col.key &&
              (sortDir === "asc" ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              ))}
          </button>
        ))}
      </div>

      <div className="divide-y divide-stone-100">
        {sorted.length === 0 && (
          <div className="px-4 py-16 text-center text-sm text-stone-400">
            No tasks yet — create your first one.
          </div>
        )}
        {sorted.map((task) => {
          const overdue = task.dueDate ? isOverdue(task.dueDate) : false;
          return (
            <button
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="grid w-full grid-cols-12 items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-stone-50"
            >
              <span className="col-span-4 truncate text-sm font-medium text-stone-800">
                {task.title}
              </span>
              <span className="col-span-2">
                <StatusBadge status={task.status} />
              </span>
              <span className="col-span-2">
                <PriorityBadge priority={task.priority} />
              </span>
              <span className="col-span-2 flex items-center gap-1.5">
                {task.assignee && (
                  <>
                    <Avatar name={task.assignee.name} color={task.assignee.avatarColor} className="h-5 w-5 text-[9px]" />
                    <span className="truncate text-sm text-stone-600">
                      {task.assignee.name}
                    </span>
                  </>
                )}
                {!task.assignee && (
                  <span className="text-sm text-stone-400">Unassigned</span>
                )}
              </span>
              <span
                className={cn(
                  "col-span-2 flex items-center gap-1 text-sm",
                  overdue ? "font-medium text-red-600" : "text-stone-500"
                )}
              >
                {task.dueDate && <Calendar className="h-3.5 w-3.5" />}
                {task.dueDate ? formatDate(task.dueDate) : "—"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
