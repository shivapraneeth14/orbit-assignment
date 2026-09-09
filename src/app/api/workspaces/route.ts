import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, error } from "@/lib/api";
import { workspaceSchema } from "@/lib/validations";

export async function GET() {
  const { user, response } = await requireAuth();
  if (response) return response;

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: user.id },
    select: {
      role: true,
      workspace: {
        include: {
          _count: { select: { projects: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const workspaces = memberships.map((m) => ({
    ...m.workspace,
    role: m.role,
    projectCount: m.workspace._count.projects,
  }));

  return NextResponse.json({ workspaces });
}

export async function POST(request: Request) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const body = await request.json();
  const parsed = workspaceSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid input");

  const workspace = await prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.create({
      data: {
        name: parsed.data.name,
        ownerId: user.id,
      },
    });
    await tx.workspaceMember.create({
      data: {
        workspaceId: ws.id,
        userId: user.id,
        role: "OWNER",
      },
    });
    return ws;
  });

  return NextResponse.json(
    { workspace: { ...workspace, role: "OWNER", projectCount: 0 } },
    { status: 201 }
  );
}
