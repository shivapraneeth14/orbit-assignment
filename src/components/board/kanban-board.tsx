"use client";

import { useMemo, useRef, useState } from "react";
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
import { motion, useReducedMotion } from "framer-motion";
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
}

const columnAccents: Record<TaskStatus, string> = {
  TODO: "bg-status-todo",
  IN_PROGRESS: "bg-status-inprogress",
  IN_REVIEW: "bg-status-inreview",
  DONE: "bg-status-done",
};

export function KanbanBoard({
  tasks,
  setTasks,
  onAddTask,
  onTaskClick,
}: KanbanBoardProps) {
  const reduceMotion = useReducedMotion();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const dragStartRef = useRef<{ id: string; status: TaskStatus } | null>(null);

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

  function resolveStatus(overId: string): TaskStatus | null {
    if (TASK_STATUSES.includes(overId as TaskStatus)) {
      return overId as TaskStatus;
    }
    const overTask = findTask(overId);
    return overTask?.status ?? null;
  }

  function handleDragStart(event: DragStartEvent) {
    const task = findTask(String(event.active.id));
    if (!task) return;
    setActiveTask(task);
    dragStartRef.current = { id: task.id, status: task.status };
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) return;
    const current = findTask(String(event.active.id));
    const next = resolveStatus(String(over.id));
    if (!current || !next || next === current.status) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === current.id ? { ...t, status: next } : t))
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { over } = event;
    const start = dragStartRef.current;
    dragStartRef.current = null;
    setActiveTask(null);

    if (!start || !over) return;
    const next = resolveStatus(String(over.id));
    if (next && next !== start.status) {
      persistStatus(start.id, next);
    }
  }

  function handleDragCancel() {
    const start = dragStartRef.current;
    dragStartRef.current = null;
    setActiveTask(null);
    if (!start) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === start.id ? { ...t, status: start.status } : t))
    );
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
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full gap-3 overflow-x-auto pb-2">
        {TASK_STATUSES.map((status, index) => (
          <motion.div
            key={status}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3, ease: "easeOut" }}
            className="shrink-0"
          >
            <KanbanColumn
              status={status}
              label={TASK_STATUS_LABEL[status]}
              accent={columnAccents[status]}
              tasks={tasksByStatus[status]}
              onAddTask={onAddTask}
              onTaskClick={onTaskClick}
            />
          </motion.div>
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <motion.div
            className="w-72"
            initial={{
              scale: reduceMotion ? 1 : 1.04,
              rotate: reduceMotion ? 0 : 2,
            }}
            animate={{
              scale: reduceMotion ? 1 : 1.06,
              rotate: reduceMotion ? 0 : 2.5,
            }}
            transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
          >
            <TaskCard task={activeTask} onClick={() => {}} />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}