"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, Trash2, X } from "lucide-react";
import type { Task, Member, Comment, TaskStatus, TaskPriority } from "@/lib/types";
import {
  TASK_STATUSES,
  TASK_STATUS_LABEL,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABEL,
} from "@/lib/types";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  members: Member[];
  onTaskChange: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

export function TaskModal({
  task,
  onClose,
  members,
  onTaskChange,
  onTaskDelete,
}: TaskModalProps) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in"
        onClick={onClose}
      />
      <TaskPanel
        key={task.id}
        task={task}
        members={members}
        onClose={onClose}
        onTaskChange={onTaskChange}
        onTaskDelete={onTaskDelete}
      />
    </div>
  );
}

interface TaskPanelProps {
  task: Task;
  onClose: () => void;
  members: Member[];
  onTaskChange: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

function TaskPanel({
  task,
  onClose,
  members,
  onTaskChange,
  onTaskDelete,
}: TaskPanelProps) {
  const router = useRouter();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assigneeId ?? "");
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.slice(0, 10) : ""
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/tasks/${task.id}`);
        const data = await res.json();
        if (!cancelled && res.ok && data.task?.comments) {
          setComments(data.task.comments);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [task.id]);

  async function save(fields: Partial<Task>) {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to update task.");
        return;
      }
      onTaskChange(data.task);
      toast.success("Saved.");
    } catch {
      toast.error("Failed to update task.");
    }
  }

  async function addComment() {
    if (!commentText.trim()) return;
    const body = commentText.trim();
    setCommentText("");
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        toast.success("Comment added.");
      } else {
        setCommentText(body);
        toast.error(data?.error ?? "Failed to add comment.");
      }
    } catch {
      setCommentText(body);
      toast.error("Failed to add comment.");
    }
  }

  async function deleteTask() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete task.");
        setDeleting(false);
        return;
      }
      toast.success("Task deleted.");
      onTaskDelete(task.id);
      onClose();
      router.refresh();
    } catch {
      toast.error("Failed to delete task.");
      setDeleting(false);
    }
  }

  const overdue = task.dueDate ? isOverdue(task.dueDate) : false;

  return (
    <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
      <div className="flex items-center justify-between border-b border-stone-100 px-5 py-3">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <PriorityBadge priority={priority} />
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
            Title
          </label>
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() =>
              title.trim() && title.trim() !== task.title && save({ title: title.trim() })
            }
            className="w-full resize-none rounded-lg border border-transparent bg-transparent px-1 py-1 text-lg font-semibold leading-snug text-stone-900 outline-none transition-colors hover:border-stone-200 focus:border-primary"
            rows={2}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => save({ description: description || null })}
            placeholder="Add a description..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
              Status
            </span>
            <Select
              value={status}
              onChange={(v) => {
                setStatus(v as TaskStatus);
                save({ status: v as TaskStatus });
              }}
              options={TASK_STATUSES.map((s) => ({
                value: s,
                label: TASK_STATUS_LABEL[s],
              }))}
            />
          </div>
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
              Priority
            </span>
            <Select
              value={priority}
              onChange={(v) => {
                setPriority(v as TaskPriority);
                save({ priority: v as TaskPriority });
              }}
              options={TASK_PRIORITIES.map((p) => ({
                value: p,
                label: TASK_PRIORITY_LABEL[p],
              }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-400">
              Assignee
            </span>
            <Select
              value={assigneeId}
              onChange={(v) => {
                setAssigneeId(v);
                save({ assigneeId: v || null });
              }}
              placeholder="Unassigned"
              options={[
                { value: "", label: "Unassigned" },
                ...members.map((m) => ({ value: m.userId, label: m.name })),
              ]}
            />
          </div>
          <div>
            <span className="mb-1.5 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-stone-400">
              <Calendar className="h-3 w-3" /> Due date
            </span>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              onBlur={() => {
                const v = dueDate ? new Date(dueDate).toISOString() : null;
                save({ dueDate: v });
              }}
              className={cn(overdue && "border-red-300 text-red-600")}
            />
          </div>
        </div>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-400">
            Comments ({comments.length})
          </span>
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-2.5">
                <Avatar
                  name={c.author.name}
                  color={c.author.avatarColor}
                  className="h-6 w-6 text-[10px]"
                />
                <div className="min-w-0 flex-1 rounded-lg bg-stone-50 px-3 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-stone-800">
                      {c.author.name}
                    </span>
                    <span className="text-xs text-stone-400">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-stone-600">
                    {c.body}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addComment()}
                placeholder="Write a comment..."
              />
              <Button onClick={addComment} disabled={!commentText.trim()} size="sm">
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-100 px-5 py-3">
        <Button
          variant="danger"
          size="sm"
          loading={deleting}
          onClick={deleteTask}
          className="w-full"
        >
          <Trash2 className="h-4 w-4" />
          Delete task
        </Button>
      </div>
    </div>
  );
}