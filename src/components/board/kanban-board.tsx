"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import type { Task, TaskStatus } from "@/lib/types";
import { TASK_STATUSES, TASK_STATUS_LABEL } from "@/lib/types";
import { KanbanColumn } from "@/components/board/kanban-column";
import { TaskCard } from "@/components/board/task-card";

type SetTasks = (updater: (prev: Task[]) => Task[]) => void;

interface KanbanBoardProps {
  tasks: Task[];
  setTasks: SetTasks;
  onAddTask: (status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onDragLeader?: () => void;
}

const columnAccents: Record<TaskStatus, string> = {
  TODO: "bg-stone-400",
  IN_PROGRESS: "bg-amber-500",
  IN_REVIEW: "bg-blue-500",
  DONE: "bg-green-500",
};

export function KanbanBoard({
  tasks,
  setTasks,
  onAddTask,
  onTaskClick,
}: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      DONE: [],
    };
    for (const t of tasks) map[t.status].push(t);
    return map;
  }, [tasks]);

  function findTask(id: string): Task | undefined {
    return tasks.find((t) => t.id === id);
  }

  function handleDragStart(event: DragStartEvent) {
    const task = findTask(String(event.active.id));
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    const activeTask = findTask(activeId);
    if (!activeTask) return;

    let newStatus: TaskStatus | null = null;
    if (TASK_STATUSES.includes(overId as TaskStatus)) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = findTask(overId);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus && activeTask.status !== newStatus) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeId ? { ...t, status: newStatus! } : t
        )
      );
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const task = findTask(activeId);
    if (!task) return;

    let newStatus: TaskStatus;
    if (TASK_STATUSES.includes(overId as TaskStatus)) {
      newStatus = overId as TaskStatus;
    } else {
      const overTask = findTask(overId);
      newStatus = overTask?.status ?? task.status;
    }

    if (newStatus === task.status) return;

    // Optimistic update already applied in dragOver; now persist to server
    persistStatus(task.id, newStatus);
  }

  async function persistStatus(taskId: string, status: TaskStatus) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error ?? "Failed to update task status.");
      }
    } catch {
      toast.error("Failed to update task status.");
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveTask(null);
      }}
    >
      <div className="flex h-full gap-3 overflow-x-auto pb-2">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            label={TASK_STATUS_LABEL[status]}
            accent={columnAccents[status]}
            tasks={tasksByStatus[status]}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 opacity-90">
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
