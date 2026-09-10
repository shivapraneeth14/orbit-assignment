import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input, Textarea } from "@/components/ui/input";

describe("Input", () => {
  it("forwards value changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input aria-label="Email" onChange={onChange} />);

    await user.type(screen.getByLabelText("Email"), "hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("renders the placeholder", () => {
    render(<Input placeholder="Search…" />);
    expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
  });

  it("disables input", () => {
    render(<Input aria-label="Email" disabled />);
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });
});

describe("Textarea", () => {
  it("forwards value changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Textarea aria-label="Notes" onChange={onChange} />);

    await user.type(screen.getByLabelText("Notes"), "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("disables textarea", () => {
    render(<Textarea aria-label="Notes" disabled />);
    expect(screen.getByLabelText("Notes")).toBeDisabled();
  });
});