import { test, expect } from "@playwright/test";

test("unauthenticated /dashboard redirects to /login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
});

test("authenticated /login redirects to /dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/Email/i).fill("demo@orbit.dev");
  await page.getByLabel(/Password/i).fill("demo1234");
  await page.getByRole("button", { name: /Log in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
});

test("login page renders and demo login reaches the dashboard", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: /Log in to ORBIT/i })).toBeVisible();

  const themeToggle = page.getByRole("button", { name: "Toggle theme" });
  await expect(themeToggle).toBeVisible();
  await themeToggle.click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await themeToggle.click();
  await expect(page.locator("html")).not.toHaveClass(/dark/);

  await page.getByLabel(/Email/i).fill("demo@orbit.dev");
  await page.getByLabel(/Password/i).fill("demo1234");
  await page.getByRole("button", { name: /Log in/i }).click();

  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});