import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, ListTodo } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PriorityBadge } from "@/components/ui/badge";
import { formatDate, isOverdue } from "@/lib/utils";

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Welcome back
        </h1>
        <p className="mt-0.5 text-sm text-stone-500">
          Here&apos;s what&apos;s on your plate.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<ListTodo className="h-4 w-4 text-primary" />} label="Assigned" value={total} />
        <StatCard icon={<Clock className="h-4 w-4 text-amber-500" />} label="In progress" value={inProgress} />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
          label="Overdue"
          value={overdue.length}
          alert={overdue.length > 0}
        />
        <StatCard icon={<CheckCircle2 className="h-4 w-4 text-green-500" />} label="Done" value={done} />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-700">My open tasks</h2>
            <span className="text-xs text-stone-400">
              {openTasks.length} {openTasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>
          {openTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50/40 py-12 text-center">
              <CheckCircle2 className="mb-2 h-8 w-8 text-green-300" />
              <p className="text-sm font-medium text-stone-700">You&apos;re all caught up!</p>
              <p className="mt-1 text-xs text-stone-400">No open tasks assigned to you.</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
              {openTasks.map((task) => {
                const o = task.dueDate ? isOverdue(task.dueDate) : false;
                return (
                  <Link
                    key={task.id}
                    href={`/project/${task.projectId}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-stone-50"
                  >
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: task.project.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-stone-800">{task.title}</p>
                      <p className="truncate text-xs text-stone-400">{task.project.name}</p>
                    </div>
                    {task.dueDate && (
                      <span className={`text-xs ${o ? "font-semibold text-red-600" : "text-stone-400"}`}>
                        {o ? "Overdue · " : ""}
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    <PriorityBadge priority={task.priority} />
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside>
          <h2 className="mb-3 text-sm font-semibold text-stone-700">Recent projects</h2>
          <div className="space-y-2">
            {recentProjects.flatMap((m) =>
              m.workspace.projects.map((p) => {
                const total = p.tasks.length;
                const done = p.tasks.filter((t) => t.status === "DONE").length;
                const progress = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                  <Link
                    key={p.id}
                    href={`/project/${p.id}`}
                    className="block rounded-xl border border-stone-200 bg-white p-3 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-stone-800">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-stone-300" />
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs text-stone-400">
                      <span>{done}/{total} done</span>
                      <span>{progress}%</span>
                    </div>
                  </Link>
                );
              })
            )}
            {recentProjects.every((m) => m.workspace.projects.length === 0) && (
              <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/40 p-6 text-center text-sm text-stone-400">
                No projects yet.
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-2 text-stone-400">{icon}</div>
      <p className={`mt-3 text-2xl font-bold tracking-tight ${alert ? "text-red-600" : "text-stone-900"}`}>
        {value}
      </p>
      <p className="text-xs font-medium uppercase tracking-wide text-stone-400">{label}</p>
    </div>
  );
}
