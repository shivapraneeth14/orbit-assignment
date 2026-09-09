import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, error } from "@/lib/api";
import { requireWorkspaceMember } from "@/lib/permissions";
import { projectSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");
  if (!workspaceId) return error("workspaceId is required.");

  const authorized = await requireWorkspaceMember(workspaceId, user.id, {
    ok: false,
    status: 403,
    message: "",
  });
  if (!authorized.ok) return error(authorized.message, authorized.status);

  const projects = await prisma.project.findMany({
    where: { workspaceId },
    include: {
      _count: { select: { tasks: true } },
      tasks: {
        select: { status: true },
        where: { status: "DONE" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const formatted = projects.map((p) => {
    const total = p._count.tasks;
    const done = p.tasks.length;
    return {
      id: p.id,
      workspaceId: p.workspaceId,
      name: p.name,
      description: p.description,
      color: p.color,
      status: p.status,
      createdAt: p.createdAt,
      taskCount: total,
      doneCount: done,
      progress: total === 0 ? 0 : Math.round((done / total) * 100),
    };
  });

  return NextResponse.json({ projects: formatted });
}

export async function POST(request: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const body = await request.json();
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid input");

  const authorized = await requireWorkspaceMember(parsed.data.workspaceId, user.id, {
    ok: false,
    status: 403,
    message: "",
  });
  if (!authorized.ok) return error(authorized.message, authorized.status);

  const project = await prisma.project.create({
    data: {
      workspaceId: parsed.data.workspaceId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      color: parsed.data.color ?? "#3B4CFF",
    },
  });

  return NextResponse.json(
    {
      project: {
        ...project,
        taskCount: 0,
        doneCount: 0,
        progress: 0,
      },
    },
    { status: 201 }
  );
}
