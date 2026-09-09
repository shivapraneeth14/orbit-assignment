import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, error } from "@/lib/api";
import { requireWorkspaceMember, canManageMembers } from "@/lib/permissions";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;

  const authorized = await requireWorkspaceMember(id, user.id, {
    ok: false,
    status: 403,
    message: "",
  });
  if (!authorized.ok) return error(authorized.message, authorized.status);

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId: id },
    include: {
      user: { select: { id: true, name: true, email: true, avatarColor: true } },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  const formatted = members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    name: m.user.name,
    email: m.user.email,
    avatarColor: m.user.avatarColor,
  }));

  return NextResponse.json({ members: formatted });
}

export async function DELETE(request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;

  const canManage = await canManageMembers(id, user.id);
  if (!canManage) {
    return error("Only owners and admins can remove members.", 403);
  }

  const body = await request.json();
  const memberId = body?.memberId as string | undefined;
  if (!memberId || typeof memberId !== "string") {
    return error("memberId is required.");
  }

  const target = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
  });
  if (!target || target.workspaceId !== id) {
    return error("Member not found.", 404);
  }

  // Cannot remove the workspace owner
  if (target.role === "OWNER") {
    return error("The owner cannot be removed. Transfer ownership or delete the workspace.", 400);
  }

  await prisma.workspaceMember.delete({ where: { id: memberId } });
  return NextResponse.json({ success: true });
}
