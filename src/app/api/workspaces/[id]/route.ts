import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, error } from "@/lib/api";
import { getWorkspaceRole } from "@/lib/permissions";
import { workspaceSchema } from "@/lib/validations";

interface Context {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const role = await getWorkspaceRole(id, user.id);
  if (!role) return error("You are not a member of this workspace.", 403);

  const body = await request.json();
  const parsed = workspaceSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues[0]?.message ?? "Invalid input");

  const updated = await prisma.workspace.update({
    where: { id },
    data: { name: parsed.data.name },
  });
  return NextResponse.json({ workspace: updated });
}

export async function DELETE(_request: Request, { params }: Context) {
  const { user, response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace) return error("Workspace not found.", 404);

  if (workspace.ownerId !== user.id) {
    return error("Only the workspace owner can delete this workspace.", 403);
  }

  // Cascading delete removes members, projects, and tasks
  await prisma.workspace.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
