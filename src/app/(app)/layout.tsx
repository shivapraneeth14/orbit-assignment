import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Shell } from "@/components/layout/shell";
import type { Workspace, Project } from "@/lib/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [memberships, user] = await Promise.all([
    prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            projects: {
              where: { status: "ACTIVE" },
              orderBy: { createdAt: "asc" },
              include: {
                tasks: { select: { status: true } },
              },
            },
            _count: { select: { projects: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatarColor: true },
    }),
  ]);

  if (!user) redirect("/login");

  const workspaces: Workspace[] = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    ownerId: m.workspace.ownerId,
    createdAt: m.workspace.createdAt.toISOString(),
    role: m.role,
    projectCount: m.workspace._count.projects,
  }));

  const currentWorkspace = workspaces[0] ?? null;

  const projects: Project[] = memberships.flatMap((m) =>
    m.workspace.projects.map((p) => {
      const total = p.tasks.length;
      const done = p.tasks.filter((t) => t.status === "DONE").length;
      return {
        id: p.id,
        workspaceId: p.workspaceId,
        name: p.name,
        description: p.description,
        color: p.color,
        status: p.status,
        createdAt: p.createdAt.toISOString(),
        taskCount: total,
        doneCount: done,
        progress: total === 0 ? 0 : Math.round((done / total) * 100),
      };
    })
  );

  return (
    <Shell
      workspaces={workspaces}
      currentWorkspace={currentWorkspace}
      projects={projects}
      userName={user.name}
      userEmail={user.email}
      avatarColor={user.avatarColor}
    >
      {children}
    </Shell>
  );
}
