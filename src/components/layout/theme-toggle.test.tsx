import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@/lib/theme-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.className = "";
    window.localStorage.clear();
  });

  it("renders a toggle button", () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(
      screen.getByRole("button", { name: "Toggle theme" }),
    ).toBeInTheDocument();
  });

  it("toggles dark mode on click and persists the choice", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    const button = screen.getByRole("button", { name: "Toggle theme" });

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    await user.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("orbit.theme")).toBe("dark");

    await user.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("orbit.theme")).toBe("light");
  });
});