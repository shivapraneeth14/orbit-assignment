import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, error } from "@/lib/api";
import { requireWorkspaceMember } from "@/lib/permissions";
import { taskUpdateSchema } from "@/lib/validations";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true, avatarColor: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true, avatarColor: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!task) return error("Task not found.", 404);

  const project = await prisma.project.findUnique({
    where: { id: task.projectId },
    select: { workspaceId: true },
  });
  const authorized = await requireWorkspaceMember(project!.workspaceId, user.id, {
    ok: false,
    status: 403,
    message: "",
  });
  if (!authorized.ok) return error(authorized.message, authorized.status);

  return NextResponse.json({ task });
}

export async function PATCH(request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const existing = await prisma.task.findUnique({
    where: { id },
    include: { project: { select: { workspaceId: true } } },
  });
  if (!existing) return error("Task not found.", 404);

  const authorized = await requireWorkspaceMember(
    existing.project.workspaceId,
    user.id,
    { ok: false, status: 403, message: "" }
  );
  if (!authorized.ok) return error(authorized.message, authorized.status);

  const body = await request.json();
  const parsed = taskUpdateSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid input");

  if (parsed.data.assigneeId !== undefined && parsed.data.assigneeId !== null) {
    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: existing.project.workspaceId,
          userId: parsed.data.assigneeId,
        },
      },
    });
    if (!isMember) {
      return error("Assignee must be a member of this workspace.", 400);
    }
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.description !== undefined && {
        description: parsed.data.description,
      }),
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
      ...(parsed.data.priority !== undefined && { priority: parsed.data.priority }),
      ...(parsed.data.assigneeId !== undefined && {
        assigneeId: parsed.data.assigneeId,
      }),
      ...(parsed.data.dueDate !== undefined && {
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      }),
    },
    include: {
      assignee: { select: { id: true, name: true, avatarColor: true } },
    },
  });

  return NextResponse.json({ task: updated });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const existing = await prisma.task.findUnique({
    where: { id },
    include: { project: { select: { workspaceId: true } } },
  });
  if (!existing) return error("Task not found.", 404);

  const authorized = await requireWorkspaceMember(
    existing.project.workspaceId,
    user.id,
    { ok: false, status: 403, message: "" }
  );
  if (!authorized.ok) return error(authorized.message, authorized.status);

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
