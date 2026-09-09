import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, FolderKanban } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceRole } from "@/lib/permissions";
import { CreateProjectButton } from "@/components/workspace/create-project-button";

interface PageProps {
  params: Promise<{ workspaceId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { workspaceId } = await params;
  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  return { title: ws?.name ?? "Workspace" };
}

export default async function WorkspacePage({ params }: PageProps) {
  const session = await auth();
  const userId = session!.user.id;
  const { workspaceId } = await params;

  const [workspace, role] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: { select: { id: true } },
        projects: {
          orderBy: { createdAt: "asc" },
          include: { tasks: { select: { status: true } } },
        },
      },
    }),
    getWorkspaceRole(workspaceId, userId),
  ]);

  if (!workspace || !role) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">{workspace.name}</h1>
          <p className="mt-0.5 text-sm text-stone-500">
            {workspace.members.length} {workspace.members.length === 1 ? "member" : "members"} ·{" "}
            {workspace.projects.length} {workspace.projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <CreateProjectButton workspaceId={workspaceId} />
      </div>

      {workspace.projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 bg-stone-50/40 py-16 text-center">
          <FolderKanban className="mb-3 h-10 w-10 text-stone-300" />
          <h3 className="text-sm font-semibold text-stone-700">No projects yet</h3>
          <p className="mt-1 text-sm text-stone-500">
            Break your work into projects to get started.
          </p>
          <div className="mt-4">
            <CreateProjectButton workspaceId={workspaceId} variant="primary" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspace.projects
              .filter((p) => p.status === "ACTIVE")
              .map((project) => {
                const total = project.tasks.length;
                const done = project.tasks.filter((t) => t.status === "DONE").length;
                const progress = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    className="group rounded-xl border border-stone-200 bg-white p-5 transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="h-3 w-3 rounded-md" style={{ backgroundColor: project.color }} />
                      <span className="text-xs text-stone-400">
                        {total} {total === 1 ? "task" : "tasks"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-stone-800 group-hover:text-primary">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                        {project.description}
                      </p>
                    )}
                    <div className="mt-4">
                      <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${progress}%`, backgroundColor: project.color }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-stone-400">
                        <span>{done}/{total} done</span>
                        <span className="font-medium text-stone-600">{progress}%</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>

          {workspace.projects.some((p) => p.status === "ARCHIVED") && (
            <div className="mt-10">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-500">
                <Archive className="h-4 w-4" /> Archived
              </h2>
              <div className="space-y-2">
                {workspace.projects
                  .filter((p) => p.status === "ARCHIVED")
                  .map((project) => (
                    <Link
                      key={project.id}
                      href={`/project/${project.id}`}
                      className="flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-500 hover:bg-stone-100"
                    >
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: project.color }} />
                      {project.name}
                      <span className="ml-auto text-xs text-stone-400">Archived</span>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
