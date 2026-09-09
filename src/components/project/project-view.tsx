"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Archive, KanbanSquare, List, MoreVertical, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Task, Member, TaskStatus } from "@/lib/types";
import { KanbanBoard } from "@/components/board/kanban-board";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskModal } from "@/components/tasks/task-modal";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { Dropdown } from "@/components/ui/dropdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProjectViewProps {
  project: {
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    color: string;
    status: string;
    progress: number;
    doneCount: number;
    taskCount: number;
  };
  members: Member[];
  initialTasks: Task[];
}

export function ProjectView({ project, members, initialTasks }: ProjectViewProps) {
  const router = useRouter();
  const [view, setView] = useState<"board" | "list">("board");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("TODO");

  function setTasksFn(updater: (prev: Task[]) => Task[]) {
    setTasks(updater);
  }

  function openCreate(status: TaskStatus) {
    setCreateStatus(status);
    setCreateOpen(true);
  }

  function handleTaskChange(updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSelectedTask((prev) => (prev && prev.id === updated.id ? updated : prev));
  }

  function handleTaskDelete(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  async function archiveOrRestore() {
    const archived = project.status === "ARCHIVED";
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: archived ? "ACTIVE" : "ARCHIVED" }),
      });
      if (res.ok) {
        toast.success(archived ? "Project restored." : "Project archived.");
        router.refresh();
      } else {
        toast.error("Failed to update project.");
      }
    } catch {
      toast.error("Failed to update project.");
    }
  }

  async function deleteProject() {
    if (!confirm("Delete this project and all its tasks? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Project deleted.");
        router.push(`/workspace/${project.workspaceId}`);
        router.refresh();
      } else {
        toast.error("Failed to delete project.");
      }
    } catch {
      toast.error("Failed to delete project.");
    }
  }

  const actions: { label: string; items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] }[] = [
    {
      label: "Project",
      items: [
        {
          label: project.status === "ARCHIVED" ? "Restore project" : "Archive project",
          icon: project.status === "ARCHIVED" ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />,
          onClick: archiveOrRestore,
        },
        {
          label: "Delete project",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: deleteProject,
          danger: true,
        },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4 sm:px-6">
        <span className="h-3 w-3 shrink-0 rounded-md" style={{ backgroundColor: project.color }} />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-base font-semibold text-stone-900">{project.name}</h1>
          {project.description && (
            <p className="hidden truncate text-xs text-stone-400 sm:block">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-0.5">
          <button
            onClick={() => setView("board")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              view === "board" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
            )}
          >
            <KanbanSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Board</span>
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              view === "list" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800"
            )}
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>

        <Button onClick={() => openCreate("TODO")} size="sm" className="ml-1">
          <Plus className="h-4 w-4" />
          New task
        </Button>

        <Dropdown
          align="right"
          items={actions}
          trigger={
            <button className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
              <MoreVertical className="h-4 w-4" />
            </button>
          }
        />
      </div>

      <div className="flex-1 overflow-hidden p-4 sm:p-6">
        {view === "board" ? (
          <div className="h-full overflow-hidden">
            <KanbanBoard
              tasks={tasks}
              setTasks={setTasksFn}
              onAddTask={openCreate}
              onTaskClick={setSelectedTask}
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <TaskListView tasks={tasks} onTaskClick={setSelectedTask} />
          </div>
        )}
      </div>

      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        projectId={project.id}
        members={members}
        defaultStatus={createStatus}
        onCreated={(task) => {
          setTasks((prev) => [...prev, task as Task]);
          setCreateOpen(false);
        }}
      />

      <TaskModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        members={members}
        onTaskChange={handleTaskChange}
        onTaskDelete={handleTaskDelete}
      />
    </div>
  );
}
