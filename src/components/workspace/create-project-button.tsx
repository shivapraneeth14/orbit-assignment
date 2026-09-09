"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreateProjectModal } from "@/components/workspace/create-project-modal";
import { cn } from "@/lib/utils";

interface CreateProjectButtonProps {
  workspaceId: string;
  variant?: "primary" | "outline";
  className?: string;
}

export function CreateProjectButton({
  workspaceId,
  variant = "primary",
  className,
}: CreateProjectButtonProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button
        variant={variant}
        onClick={() => setOpen(true)}
        className={cn(className)}
      >
        <Plus className="h-4 w-4" />
        New project
      </Button>
      <CreateProjectModal
        open={open}
        onClose={() => setOpen(false)}
        workspaceId={workspaceId}
        onCreated={(projectId) => {
          setOpen(false);
          router.push(`/project/${projectId}`);
          router.refresh();
        }}
      />
    </>
  );
}
