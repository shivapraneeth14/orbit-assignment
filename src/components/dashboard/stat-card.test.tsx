import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/dashboard/stat-card";

vi.mock("@/components/dashboard/count-up", () => ({
  CountUp: ({ value }: { value: number }) => <span>{value}</span>,
}));

describe("StatCard", () => {
  it("renders the label and animated value", () => {
    render(<StatCard icon={null} label="Done" value={7} />);
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("applies alert styling when the alert flag is set", () => {
    render(<StatCard icon={null} label="Overdue" value={3} alert />);
    expect(screen.getByText("3").closest("p")).toHaveClass("text-priority-high");
  });
});