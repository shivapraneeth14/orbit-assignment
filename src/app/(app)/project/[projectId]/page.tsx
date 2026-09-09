import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/permissions";
import { ProjectView } from "@/components/project/project-view";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { projectId } = await params;
  const p = await prisma.project.findUnique({ where: { id: projectId } });
  return { title: p?.name ?? "Project" };
}

export default async function ProjectPage({ params }: PageProps) {
  const session = await auth();
  const userId = session!.user.id;
  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) notFound();

  const roleRes = await getWorkspaceRole(project.workspaceId, userId);
  if (!roleRes) notFound();

  const [memberRows, taskRows] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { workspaceId: project.workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarColor: true } },
      },
    }),
    prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, avatarColor: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const membersData = memberRows.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    name: m.user.name,
    email: m.user.email,
    avatarColor: m.user.avatarColor,
  }));

  const tasksData = taskRows.map((t) => ({
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    assigneeId: t.assigneeId,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    assignee: t.assignee
      ? {
          id: t.assignee.id,
          name: t.assignee.name,
          avatarColor: t.assignee.avatarColor,
        }
      : null,
  }));

  const total = tasksData.length;
  const done = tasksData.filter((t) => t.status === "DONE").length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <ProjectView
      project={{
        id: project.id,
        workspaceId: project.workspaceId,
        name: project.name,
        description: project.description,
        color: project.color,
        status: project.status,
        progress,
        doneCount: done,
        taskCount: total,
      }}
      members={membersData}
      initialTasks={tasksData}
    />
  );
}
