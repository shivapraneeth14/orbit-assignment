import { prisma } from "@/lib/prisma";
import type { WorkspaceRole } from "@/generated/prisma/enums";

export async function getWorkspaceRole(
  workspaceId: string,
  userId: string
): Promise<WorkspaceRole | null> {
  const member = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
    select: { role: true },
  });
  return member?.role ?? null;
}

export async function isWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const role = await getWorkspaceRole(workspaceId, userId);
  return role !== null;
}

export async function canManageMembers(
  workspaceId: string,
  userId: string
): Promise<boolean> {
  const role = await getWorkspaceRole(workspaceId, userId);
  return role === "OWNER" || role === "ADMIN";
}

export async function requireWorkspaceMember(
  workspaceId: string,
  userId: string,
  result: { ok: boolean; status: number; message: string }
) {
  const role = await getWorkspaceRole(workspaceId, userId);
  if (!role) {
    return {
      ...result,
      ok: false,
      status: 403,
      message: "You are not a member of this workspace.",
    };
  }
  return { ...result, ok: true, role };
}
