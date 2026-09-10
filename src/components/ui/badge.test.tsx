import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, PriorityBadge } from "@/components/ui/badge";

describe("StatusBadge", () => {
  it.each([
    ["TODO", "To do"],
    ["IN_PROGRESS", "In progress"],
    ["IN_REVIEW", "In review"],
    ["DONE", "Done"],
  ])("renders %s with label %s", (status, label) => {
    render(<StatusBadge status={status as "TODO"} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("uses the in-progress token styling", () => {
    render(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText("In progress").className).toContain(
      "bg-status-inprogress-soft"
    );
  });

  it("uses the done token styling", () => {
    render(<StatusBadge status="DONE" />);
    expect(screen.getByText("Done").className).toContain("bg-status-done-soft");
  });
});

describe("PriorityBadge", () => {
  it("renders each priority label", () => {
    render(<PriorityBadge priority="URGENT" />);
    const batch = screen.getByText("URGENT");
    expect(batch.className).toContain("bg-priority-urgent-soft");
  });
});