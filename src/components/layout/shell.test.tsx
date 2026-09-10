import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Shell } from "@/components/layout/shell";
import { ThemeProvider } from "@/lib/theme-context";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

const workspaces = [
  { id: "ws1", name: "Acme", ownerId: "u1", role: "OWNER" as const, projectCount: 1, createdAt: "2026-01-01T00:00:00.000Z" },
];
const projects = [
  { id: "p1", workspaceId: "ws1", name: "Launch", description: "", color: "#f00", status: "ACTIVE" as const, createdAt: "", taskCount: 0, doneCount: 0, progress: 0 },
];

function renderShell() {
  return render(
    <ThemeProvider>
      <Shell
        workspaces={workspaces}
        currentWorkspace={workspaces[0]}
        projects={projects}
        userName="Demo User"
        userEmail="demo@orbit.dev"
        avatarColor="#3b4cff"
      >
        <main>Page content</main>
      </Shell>
    </ThemeProvider>
  );
}

describe("Shell", () => {
  it("renders the sidebar and page content", () => {
    renderShell();
    expect(screen.getAllByText("ORBIT").length).toBeGreaterThan(0);
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });

  it("opens the mobile drawer via the menu button", async () => {
    const user = userEvent.setup();
    renderShell();

    expect(screen.queryByTestId("sidebar-backdrop")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByTestId("sidebar-backdrop")).toBeInTheDocument();
  });

  it("closes the drawer when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    renderShell();

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByTestId("sidebar-backdrop"));
    expect(screen.queryByTestId("sidebar-backdrop")).toBeNull();
  });
});