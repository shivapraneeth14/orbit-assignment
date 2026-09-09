import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, error } from "@/lib/api";
import { requireWorkspaceMember } from "@/lib/permissions";
import { taskSchema } from "@/lib/validations";

interface ProjectWithWorkspace {
  workspaceId: string;
  id: string;
}

async function assertProjectAccess(
  projectId: string,
  userId: string
): Promise<{ project?: ProjectWithWorkspace; response?: NextResponse }> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, workspaceId: true },
  });
  if (!project) {
    return { response: error("Project not found.", 404) };
  }
  const authorized = await requireWorkspaceMember(project.workspaceId, userId, {
    ok: false,
    status: 403,
    message: "",
  });
  if (!authorized.ok) {
    return { response: error(authorized.message, authorized.status) };
  }
  return { project };
}

export async function GET(request: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  if (!projectId) return error("projectId is required.");

  const { response: accessResponse } = await assertProjectAccess(projectId, user.id);
  if (accessResponse) return accessResponse;

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true, avatarColor: true } },
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(request: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const body = await request.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid input");

  const { response: accessResponse } = await assertProjectAccess(
    parsed.data.projectId,
    user.id
  );
  if (accessResponse) return accessResponse;

  // If an assignee is provided, ensure they are a member of the project's workspace
  if (parsed.data.assigneeId) {
    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
      select: { workspaceId: true },
    });
    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project!.workspaceId,
          userId: parsed.data.assigneeId,
        },
      },
    });
    if (!isMember) {
      return error("Assignee must be a member of this workspace.", 400);
    }
  }

  const task = await prisma.task.create({
    data: {
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status ?? "TODO",
      priority: parsed.data.priority ?? "MEDIUM",
      assigneeId: parsed.data.assigneeId ?? null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
    include: {
      assignee: { select: { id: true, name: true, avatarColor: true } },
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}
