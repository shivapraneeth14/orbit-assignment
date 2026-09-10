import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/lib/theme-context";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

const workspaces = [{ id: "ws1", name: "Acme", ownerId: "u1", role: "OWNER" as const, projectCount: 1, createdAt: "2026-01-01T00:00:00.000Z" }];
const projects = [
  { id: "p1", workspaceId: "ws1", name: "Launch", description: "", color: "#f00", status: "ACTIVE" as const, createdAt: "", taskCount: 0, doneCount: 0, progress: 100 },
];

function renderSidebar(props: Partial<Parameters<typeof Sidebar>[0]> = {}) {
  return render(
    <ThemeProvider>
      <Sidebar
        workspaces={workspaces}
        currentWorkspace={workspaces[0]}
        projects={projects}
        userName="Demo User"
        userEmail="demo@orbit.dev"
        avatarColor="#3b4cff"
        open={false}
        onClose={vi.fn()}
        onOpenCreateProject={vi.fn()}
        {...props}
      />
    </ThemeProvider>
  );
}

describe("Sidebar", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the brand, nav, workspace and projects", () => {
    renderSidebar();
    expect(screen.getByText("ORBIT")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Projects/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Settings/i })).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Launch/i })).toBeInTheDocument();
  });

  it("marks the active nav item for the current path", () => {
    renderSidebar();
    const dashboard = screen.getByRole("link", { name: /Dashboard/i });
    expect(dashboard.className).toContain("text-primary");
    const projects = screen.getByRole("link", { name: /Projects/i });
    expect(projects.className).toContain("text-ink-muted");
  });

  it("closes the drawer when a project is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderSidebar({ open: true, onClose });

    await user.click(screen.getByRole("link", { name: /Launch/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("shows a backdrop while open and closes on backdrop click", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderSidebar({ open: true, onClose });

    const backdrop = screen.getByTestId("sidebar-backdrop");
    expect(backdrop).toBeInTheDocument();

    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("signs out from the user menu", async () => {
    const user = userEvent.setup();
    const { signOut } = await import("next-auth/react");
    renderSidebar();

    await user.click(screen.getByText("Demo User"));
    await user.click(screen.getByRole("menuitem", { name: /Sign out/i }));

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("opens the create-project flow from the sidebar action", async () => {
    const user = userEvent.setup();
    const onOpenCreateProject = vi.fn();
    renderSidebar({ onOpenCreateProject });

    await user.click(screen.getByRole("button", { name: "New project" }));
    expect(onOpenCreateProject).toHaveBeenCalledTimes(1);
  });
});