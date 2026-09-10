import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "@/components/ui/select";

const options = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B", disabled: true },
];

describe("Select", () => {
  it("shows the placeholder, then opens a listbox", async () => {
    const user = userEvent.setup();
    render(
      <Select value="" onChange={vi.fn()} options={options} placeholder="Pick one" />
    );

    const trigger = screen.getByRole("button", { name: "Pick one" });
    await user.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Option A" })).toBeInTheDocument();
  });

  it("selects an option and closes the listbox", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select value="" onChange={onChange} options={options} />);

    await user.click(screen.getByRole("button", { name: "Select" }));
    await user.click(screen.getByRole("option", { name: "Option A" }));

    expect(onChange).toHaveBeenCalledWith("a");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("exposes the selected value as the trigger label", () => {
    render(<Select value="b" onChange={vi.fn()} options={options} />);
    expect(screen.getByRole("button", { name: "Option B" })).toBeInTheDocument();
  });

  it("does not select a disabled option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Select value="a" onChange={onChange} options={options} />);

    await user.click(screen.getByRole("button", { name: "Option A" }));
    const disabled = screen.getByRole("option", { name: "Option B" });
    expect(disabled).toBeDisabled();
    await user.click(disabled).catch(() => {});
    expect(onChange).not.toHaveBeenCalledWith("b");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Select value="" onChange={vi.fn()} options={options} />);

    await user.click(screen.getByRole("button", { name: "Select" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("announces expanded state on the trigger", async () => {
    const user = userEvent.setup();
    render(<Select value="" onChange={vi.fn()} options={options} />);

    const trigger = screen.getByRole("button", { name: "Select" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});