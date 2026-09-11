"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.workspace) {
        toast.success("Workspace created.");
        router.push(`/workspace/${data.workspace.id}`);
        router.refresh();
      } else {
        toast.error(data?.error ?? "Failed to create workspace.");
        setLoading(false);
      }
    } catch {
      toast.error("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-6">
      <h1 className="text-lg font-bold text-ink">Create a workspace</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Workspaces group your projects and team members.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-ink-muted" htmlFor="ws-name">
            Workspace name
          </label>
          <Input
            id="ws-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Engineering"
            required
            autoFocus
          />
        </div>
        <Button type="submit" loading={loading} className="w-full">
          Create workspace
        </Button>
      </form>
    </div>
  );
}
