import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "@/components/dashboard/project-card";

describe("ProjectCard", () => {
  it("renders the project name and progress", () => {
    render(
      <ProjectCard
        projectId="p1"
        name="Launch"
        color="#f00"
        doneCount={2}
        totalCount={4}
        progress={50}
      />
    );

    const link = screen.getByRole("link", { name: /Launch/i });
    expect(link).toHaveAttribute("href", "/project/p1");
    expect(screen.getByText("Launch")).toBeInTheDocument();
    expect(screen.getByText("2/4 done")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});