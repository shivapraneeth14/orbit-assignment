import { test, expect } from "@playwright/test";

test.describe("responsive shell", () => {
  test("opens and closes the mobile drawer", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/login");
    await page.getByLabel(/Email/i).fill("demo@orbit.dev");
    await page.getByLabel(/Password/i).fill("demo1234");
    await page.getByRole("button", { name: /Log in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByTestId("sidebar-backdrop")).toBeVisible();
    await expect(page.getByRole("link", { name: /ORBIT/i }).first()).toBeVisible();

    await page.getByTestId("sidebar-backdrop").click({ position: { x: 340, y: 400 } });
    await expect(page.getByTestId("sidebar-backdrop")).toBeHidden();
  });
});