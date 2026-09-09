import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, error } from "@/lib/api";
import { requireWorkspaceMember } from "@/lib/permissions";
import { projectUpdateSchema } from "@/lib/validations";

interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      _count: { select: { tasks: true } },
      tasks: { select: { status: true } },
    },
  });
  if (!project) return error("Project not found.", 404);

  const authorized = await requireWorkspaceMember(project.workspaceId, user.id, {
    ok: false,
    status: 403,
    message: "",
  });
  if (!authorized.ok) return error(authorized.message, authorized.status);

  const total = project._count.tasks;
  const done = project.tasks.filter((t) => t.status === "DONE").length;

  return NextResponse.json({
    project: {
      id: project.id,
      workspaceId: project.workspaceId,
      name: project.name,
      description: project.description,
      color: project.color,
      status: project.status,
      createdAt: project.createdAt,
      taskCount: total,
      doneCount: done,
      progress: total === 0 ? 0 : Math.round((done / total) * 100),
    },
  });
}

export async function PATCH(request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return error("Project not found.", 404);

  const authorized = await requireWorkspaceMember(project.workspaceId, user.id, {
    ok: false,
    status: 403,
    message: "",
  });
  if (!authorized.ok) return error(authorized.message, authorized.status);

  const body = await request.json();
  const parsed = projectUpdateSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid input");

  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && {
        description: parsed.data.description,
      }),
      ...(parsed.data.color !== undefined && { color: parsed.data.color }),
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
    },
  });

  return NextResponse.json({ project: updated });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return error("Project not found.", 404);

  const authorized = await requireWorkspaceMember(project.workspaceId, user.id, {
    ok: false,
    status: 403,
    message: "",
  });
  if (!authorized.ok) return error(authorized.message, authorized.status);

  await prisma.project.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
