import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/permissions";
import { MemberManager } from "@/components/workspace/member-manager";

interface PageProps {
  params: Promise<{ workspaceId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { workspaceId } = await params;
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  return { title: `${ws?.name ?? "Workspace"} · Settings` };
}

export default async function WorkspaceSettingsPage({ params }: PageProps) {
  const session = await auth();
  const userId = session!.user.id;
  const { workspaceId } = await params;

  const [workspace, role, members] = await Promise.all([
    prisma.workspace.findUnique({ where: { id: workspaceId } }),
    getWorkspaceRole(workspaceId, userId),
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarColor: true } },
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  if (!workspace || !role) notFound();

  const canManage = role === "OWNER" || role === "ADMIN";

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Workspace settings</h1>
        <p className="mt-0.5 text-sm text-stone-500">
          Manage your workspace members and roles.
        </p>
      </div>

      <MemberManager
        workspaceId={workspaceId}
        workspaceName={workspace.name}
        canManage={canManage}
        currentUserId={userId}
        initialMembers={members.map((m) => ({
          id: m.id,
          userId: m.userId,
          role: m.role,
          name: m.user.name,
          email: m.user.email,
          avatarColor: m.user.avatarColor,
        }))}
      />
    </div>
  );
}
