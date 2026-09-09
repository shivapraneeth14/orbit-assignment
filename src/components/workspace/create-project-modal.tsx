"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

const PRESET_COLORS = ["#3b4cff", "#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#14b8a6"];

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId?: string;
  onCreated: (projectId: string) => void;
}

export function CreateProjectModal({ open, onClose, workspaceId, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspaceId) {
      toast.error("No workspace selected.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, name, description: description || null, color }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error ?? "Failed to create project.");
        setLoading(false);
        return;
      }
      toast.success("Project created.");
      setName("");
      setDescription("");
      onCreated(data.project.id);
    } catch {
      toast.error("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New project" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700" htmlFor="project-name">
            Project name
          </label>
          <Input
            id="project-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mobile App"
            required
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700" htmlFor="project-desc">
            Description <span className="text-stone-400">(optional)</span>
          </label>
          <Textarea
            id="project-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
          />
        </div>
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-stone-700">Color</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-7 w-7 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-2 ring-stone-400 scale-110" : "hover:scale-110"}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
