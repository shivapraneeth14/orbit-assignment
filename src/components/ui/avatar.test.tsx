import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/ui/avatar";

describe("Avatar", () => {
  it("renders initials for a first/last name pair", () => {
    render(<Avatar name="Shiva Praneeth" color="#111" />);
    expect(screen.getByTitle("Shiva Praneeth")).toHaveTextContent("SP");
  });

  it("renders a fallback when no name is provided", () => {
    render(<Avatar name={null} color="#111" />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("uses the provided color as its background", () => {
    render(<Avatar name="A B" color="#ff0000" />);
    expect(screen.getByTitle("A B").style.backgroundColor).toBe("rgb(255, 0, 0)");
  });
});