import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PriorityBadge } from "@/components/ui/badge";
import { formatDate, isOverdue, cn } from "@/lib/utils";
import { DashboardShell, StaggerContainer, StaggerItem } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { ProjectCard } from "@/components/dashboard/project-card";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [assignedTasks, stats, recentProjects] = await Promise.all([
    prisma.task.findMany({
      where: { assigneeId: userId },
      include: {
        assignee: { select: { id: true, name: true, avatarColor: true } },
        project: { select: { id: true, name: true, color: true, workspaceId: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
    prisma.task.count({
      where: { assigneeId: userId },
    }),
    prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            projects: {
              where: { status: "ACTIVE" },
              orderBy: { createdAt: "desc" },
              include: { tasks: { select: { status: true } } },
              take: 4,
            },
          },
        },
      },
    }),
  ]);

  const total = stats;
  const done = assignedTasks.filter((t) => t.status === "DONE").length;
  const overdue = assignedTasks.filter(
    (t) => t.status !== "DONE" && t.dueDate && isOverdue(t.dueDate)
  );
  const inProgress = assignedTasks.filter(
    (t) => t.status === "IN_PROGRESS" || t.status === "IN_REVIEW"
  ).length;

  const openTasks = assignedTasks.filter((t) => t.status !== "DONE");

  const statCards = [
    { id: "assigned", icon: <ListTodo className="h-4 w-4 text-primary" />, label: "Assigned", value: total },
    { id: "inprogress", icon: <Clock className="h-4 w-4 text-status-inprogress" />, label: "In progress", value: inProgress },
    { id: "overdue", icon: <AlertTriangle className="h-4 w-4 text-priority-high" />, label: "Overdue", value: overdue.length, alert: overdue.length > 0 },
    { id: "done", icon: <CheckCircle2 className="h-4 w-4 text-status-done" />, label: "Done", value: done },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <DashboardShell>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Welcome back
          </h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Here&apos;s what&apos;s on your plate.
          </p>
        </div>

        <StaggerContainer className="mb-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {statCards.map((s) => (
              <StaggerItem key={s.id}>
                <StatCard
                  icon={s.icon}
                  label={s.label}
                  value={s.value}
                  alert={s.alert}
                />
              </StaggerItem>
            ))}
          </div>
        </StaggerContainer>

        <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-muted">My open tasks</h2>
              <span className="text-xs text-ink-subtle">
                {openTasks.length} {openTasks.length === 1 ? "task" : "tasks"}
              </span>
            </div>
            {openTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted py-12 text-center">
                <CheckCircle2 className="mb-2 h-8 w-8 text-status-done" />
                <p className="text-sm font-medium text-ink">You&apos;re all caught up!</p>
                <p className="mt-1 text-xs text-ink-subtle">No open tasks assigned to you.</p>
              </div>
            ) : (
              <StaggerContainer>
                <div className="divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-surface-raised shadow-card">
                  {openTasks.map((task) => {
                    const o = task.dueDate ? isOverdue(task.dueDate) : false;
                    return (
                      <StaggerItem key={task.id}>
                        <Link
                          href={`/project/${task.projectId}`}
                          className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink/[0.03]"
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: task.project.color }} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink">{task.title}</p>
                            <p className="truncate text-xs text-ink-subtle">{task.project.name}</p>
                          </div>
                          {task.dueDate && (
                            <span className={cn("text-xs", o ? "font-semibold text-priority-high" : "text-ink-subtle")}>
                              {o ? "Overdue · " : ""}
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                          <PriorityBadge priority={task.priority} />
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </div>
              </StaggerContainer>
            )}
          </section>

          <aside>
            <h2 className="mb-3 text-sm font-semibold text-ink-muted">Recent projects</h2>
            <div className="space-y-2">
              {recentProjects.flatMap((m) =>
                m.workspace.projects.map((p) => {
                  const totalTasks = p.tasks.length;
                  const doneTasks = p.tasks.filter((t) => t.status === "DONE").length;
                  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
                  return (
                    <ProjectCard
                      key={p.id}
                      projectId={p.id}
                      name={p.name}
                      color={p.color}
                      doneCount={doneTasks}
                      totalCount={totalTasks}
                      progress={progress}
                    />
                  );
                })
              )}
              {recentProjects.every((m) => m.workspace.projects.length === 0) && (
                <div className="rounded-xl border border-dashed border-border-strong bg-surface-muted p-6 text-center text-sm text-ink-subtle">
                  No projects yet.
                </div>
              )}
            </div>
          </aside>
        </div>
      </DashboardShell>
    </div>
  );
}