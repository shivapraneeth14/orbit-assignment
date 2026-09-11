"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Member, TaskPriority, TaskStatus } from "@/lib/types";
import { TASK_PRIORITIES, TASK_PRIORITY_LABEL, TASK_STATUSES, TASK_STATUS_LABEL } from "@/lib/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  members: Member[];
  defaultStatus?: TaskStatus;
  onCreated: (task: unknown) => void;
}

export function CreateTaskModal({
  open,
  onClose,
  projectId,
  members,
  defaultStatus,
  onCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus ?? "TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title,
          description: description || null,
          status,
          priority,
          assigneeId: assigneeId || null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to create task.");
        setLoading(false);
        return;
      }
      toast.success("Task created.");
      setTitle("");
      setDescription("");
      setDueDate("");
      onCreated(data.task);
    } catch {
      toast.error("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New task" size="md">
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-muted" htmlFor="task-title">
            Title
          </label>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-muted" htmlFor="task-desc">
            Description <span className="text-ink-subtle">(optional)</span>
          </label>
          <Textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more detail..."
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-ink-muted">Status</span>
            <Select
              value={status}
              onChange={(v) => setStatus(v as TaskStatus)}
              options={TASK_STATUSES.map((s) => ({ value: s, label: TASK_STATUS_LABEL[s] }))}
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-ink-muted">Priority</span>
            <Select
              value={priority}
              onChange={(v) => setPriority(v as TaskPriority)}
              options={TASK_PRIORITIES.map((p) => ({ value: p, label: TASK_PRIORITY_LABEL[p] }))}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <span className="text-sm font-medium text-ink-muted">Assignee</span>
            <Select
              value={assigneeId}
              onChange={setAssigneeId}
              placeholder="Unassigned"
              options={[
                { value: "", label: "Unassigned" },
                ...members.map((m) => ({ value: m.userId, label: m.name })),
              ]}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-ink-muted" htmlFor="task-due">
              Due date
            </label>
            <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
