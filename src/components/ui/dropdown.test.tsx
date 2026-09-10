import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropdown } from "@/components/ui/dropdown";

describe("Dropdown", () => {
  it("opens on trigger click and fires item onClick", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    render(
      <Dropdown
        trigger={<button>Menu</button>}
        items={[{ label: "Rename", onClick: onRename }, { label: "Delete" }]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(screen.getByRole("menuitem", { name: "Rename" }));

    expect(onRename).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menuitem")).toBeNull();
  });

  it("does not open the menu when the trigger is clicked and item selected via keyboard", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        trigger={<button>Menu</button>}
        items={[{ label: "Rename" }]}
      />
    );

    await user.keyboard("{Enter}");
    expect(screen.queryByRole("menuitem")).toBeNull();
  });

  it("applies danger styling to items flagged as danger", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        trigger={<button>Menu</button>}
        items={[{ label: "Delete", danger: true }]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(screen.getByRole("menuitem", { name: "Delete" }).className).toContain(
      "text-red-600"
    );
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown trigger={<button>Menu</button>} items={[{ label: "Rename" }]} />
    );

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menuitem")).toBeNull();
  });

  it("closes when clicking outside", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button>Outside</button>
        <Dropdown trigger={<button>Menu</button>} items={[{ label: "Rename" }]} />
      </>
    );

    await user.click(screen.getByRole("button", { name: "Menu" }));
    await user.click(screen.getByRole("button", { name: "Outside" }));

    expect(screen.queryByRole("menuitem")).toBeNull();
  });
});