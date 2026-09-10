"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Plus,
  Settings,
  LogOut,
  CheckCircle2,
  Layers,
} from "lucide-react";
import type { Workspace, Project } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown, type DropdownItem } from "@/components/ui/dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface SidebarProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  projects: Project[];
  userName: string;
  userEmail: string;
  avatarColor: string;
  open: boolean;
  onClose: () => void;
  onOpenCreateProject: () => void;
}

export function Sidebar({
  workspaces,
  currentWorkspace,
  projects,
  userName,
  userEmail,
  avatarColor,
  open,
  onClose,
  onOpenCreateProject,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const workspaceSwitcherItems: DropdownItem[] = useMemo(() => {
    const entries: DropdownItem[] = workspaces.map((ws) => ({
      label: ws.name,
      value: ws.id,
      onClick: () => {
        router.push(`/workspace/${ws.id}`);
        onClose();
      },
    }));
    entries.push({
      label: "Create workspace",
      icon: <Plus className="h-4 w-4 text-primary" />,
      onClick: () => {
        router.push("/workspace/new");
        onClose();
      },
    });
    return entries;
  }, [workspaces, router, onClose]);

  const activeProjects = projects.filter((p) => p.status === "ACTIVE");

  const nav = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      active: pathname === "/dashboard",
    },
    {
      label: "Projects",
      href: `/workspace/${currentWorkspace.id}`,
      icon: <Layers className="h-4 w-4" />,
      active: pathname === `/workspace/${currentWorkspace.id}`,
    },
    {
      label: "Settings",
      href: `/workspace/${currentWorkspace.id}/settings`,
      icon: <Settings className="h-4 w-4" />,
      active: pathname.includes("settings"),
    },
  ];

  return (
    <>
      {open && (
        <div
          data-testid="sidebar-backdrop"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] lg:hidden animate-in fade-in duration-150"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border-subtle bg-surface-raised transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-border-subtle px-4">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient shadow-glow">
              <span className="text-sm font-bold text-white">O</span>
            </div>
            <span className="text-base font-bold tracking-tight text-ink">ORBIT</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="px-3 pt-3">
          <Dropdown
            items={workspaceSwitcherItems}
            width="w-full"
            trigger={
              <button className="flex w-full items-center gap-2 rounded-lg border border-border-subtle px-2.5 py-2 text-left transition-colors hover:bg-ink/5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft text-xs font-bold text-primary">
                  {currentWorkspace.name.slice(0, 2).toUpperCase()}
                </span>
                <span className="flex-1 truncate text-sm font-medium text-ink">
                  {currentWorkspace.name}
                </span>
              </button>
            }
          />
        </div>

        <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-3">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={cn(
                "relative flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                item.active
                  ? "text-primary"
                  : "text-ink-muted hover:bg-ink/5 hover:text-ink"
              )}
            >
              {item.active && (
                <motion.span
                  layoutId="nav-active"
                  transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                  className="absolute inset-0 rounded-lg bg-primary-soft"
                />
              )}
              <span className="relative flex items-center gap-2.5">
                {item.icon}
                {item.label}
              </span>
            </Link>
          ))}

          <div className="mt-4 flex items-center justify-between px-3 pb-1 pt-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-subtle">
              Projects
            </span>
            <button
              onClick={onOpenCreateProject}
              className="rounded-md p-1 text-ink-subtle transition-colors hover:bg-ink/5 hover:text-ink"
              title="New project"
              aria-label="New project"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-0.5">
            {activeProjects.length === 0 && (
              <p className="px-3 py-1 text-xs text-ink-subtle">No projects yet</p>
            )}
            {activeProjects.map((project) => {
              const isActive =
                pathname === `/project/${project.id}` ||
                pathname.startsWith(`/project/${project.id}`);
              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  onClick={onClose}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-ink/5 font-medium text-ink"
                      : "text-ink-muted hover:bg-ink/5 hover:text-ink"
                  )}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="flex-1 truncate">{project.name}</span>
                  {project.progress === 100 && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-status-done" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border-subtle p-3">
          <Dropdown
            align="right"
            direction="up"
            width="w-56"
            items={[
              {
                label: "Sign out",
                icon: <LogOut className="h-4 w-4" />,
                danger: true,
                onClick: () => signOut({ callbackUrl: "/login" }),
              },
            ]}
            trigger={
              <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-ink/5">
                <Avatar name={userName} color={avatarColor} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-ink-subtle">{userEmail}</p>
                </div>
              </div>
            }
          />
        </div>
      </aside>
    </>
  );
}