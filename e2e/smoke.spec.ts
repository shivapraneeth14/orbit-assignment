import { test, expect } from "@playwright/test";

test("login page renders and demo login reaches the dashboard", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Log in to ORBIT/i })).toBeVisible();

  await page.getByLabel(/Email/i).fill("demo@orbit.dev");
  await page.getByLabel(/Password/i).fill("demo1234");
  await page.getByRole("button", { name: /Log in/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});