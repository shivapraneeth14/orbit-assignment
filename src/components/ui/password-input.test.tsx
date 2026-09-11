import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PasswordInput } from "@/components/ui/password-input";

describe("PasswordInput", () => {
  it("renders as a password input by default", () => {
    render(<PasswordInput placeholder="secret" />);
    expect(screen.getByPlaceholderText("secret")).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
  });

  it("toggles visibility when the eye button is clicked", () => {
    render(<PasswordInput value="s3cret" onChange={() => {}} readOnly />);
    const input = screen.getByDisplayValue("s3cret");
    const toggle = screen.getByRole("button", { name: "Show password" });

    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(toggle);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide password" })).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("forwards standard input attributes", () => {
    render(<PasswordInput name="password" autoComplete="current-password" placeholder="••••••••" />);
    const input = screen.getByPlaceholderText("••••••••");
    expect(input).toHaveAttribute("name", "password");
    expect(input).toHaveAttribute("autoComplete", "current-password");
  });

  it("does not submit the form when toggling", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PasswordInput name="password" />
        <button type="submit">Submit</button>
      </form>
    );
    fireEvent.click(screen.getByRole("button", { name: "Show password" }));
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});