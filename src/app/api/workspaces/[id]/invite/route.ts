import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, error } from "@/lib/api";
import { canManageMembers } from "@/lib/permissions";
import { inviteMemberSchema } from "@/lib/validations";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;

  const canManage = await canManageMembers(id, user.id);
  if (!canManage) {
    return error(
      "Only workspace owners and admins can invite members.",
      403
    );
  }

  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace) return error("Workspace not found.", 404);

  const body = await request.json();
  const parsed = inviteMemberSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid input");

  const email = parsed.data.email.toLowerCase();
  const invitee = await prisma.user.findUnique({ where: { email } });
  if (!invitee) {
    return error(
      `No ORBIT account found for ${email}. Invite links will be sent once you share them.`,
      404
    );
  }

  if (invitee.id === user.id) {
    return error("You are already a member of this workspace.", 400);
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: id, userId: invitee.id } },
  });
  if (existing) {
    return error("This user is already a member.", 409);
  }

  const member = await prisma.workspaceMember.create({
    data: {
      workspaceId: id,
      userId: invitee.id,
      role: parsed.data.role,
    },
    include: {
      user: { select: { id: true, name: true, email: true, avatarColor: true } },
    },
  });

  return NextResponse.json(
    {
      member: {
        id: member.id,
        userId: member.userId,
        role: member.role,
        name: member.user.name,
        email: member.user.email,
        avatarColor: member.user.avatarColor,
      },
    },
    { status: 201 }
  );
}
