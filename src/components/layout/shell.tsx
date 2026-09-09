"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import type { Workspace, Project } from "@/lib/types";
import { Sidebar } from "@/components/layout/sidebar";
import { CreateProjectModal } from "@/components/workspace/create-project-modal";

interface ShellProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  projects: Project[];
  userName: string;
  userEmail: string;
  avatarColor: string;
  children: React.ReactNode;
}

export function Shell({
  workspaces,
  currentWorkspace,
  projects,
  userName,
  userEmail,
  avatarColor,
  children,
}: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const router = useRouter();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        workspaces={workspaces}
        currentWorkspace={
          currentWorkspace ?? workspaces[0] ?? { id: "", name: "Workspace" }
        }
        projects={projects}
        userName={userName}
        userEmail={userEmail}
        avatarColor={avatarColor}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenCreateProject={() => {
          setSidebarOpen(false);
          setCreateProjectOpen(true);
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-md p-1.5 text-stone-500 hover:bg-stone-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary">
              <span className="text-xs font-bold text-white">O</span>
            </div>
            <span className="text-sm font-bold text-stone-900">ORBIT</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-surface">{children}</main>
      </div>

      <CreateProjectModal
        open={createProjectOpen}
        onClose={() => setCreateProjectOpen(false)}
        workspaceId={currentWorkspace?.id ?? workspaces[0]?.id}
        onCreated={(projectId) => {
          setCreateProjectOpen(false);
          router.push(`/project/${projectId}`);
        }}
      />
    </div>
  );
}
