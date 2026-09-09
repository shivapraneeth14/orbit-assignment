import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, error } from "@/lib/api";
import { requireWorkspaceMember } from "@/lib/permissions";
import { commentSchema } from "@/lib/validations";

interface Context {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { select: { workspaceId: true } } },
  });
  if (!task) return error("Task not found.", 404);

  const authorized = await requireWorkspaceMember(
    task.project.workspaceId,
    user.id,
    { ok: false, status: 403, message: "" }
  );
  if (!authorized.ok) return error(authorized.message, authorized.status);

  const body = await request.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid input");

  const comment = await prisma.comment.create({
    data: {
      taskId: id,
      authorId: user.id,
      body: parsed.data.body,
    },
    include: {
      author: { select: { id: true, name: true, avatarColor: true } },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
