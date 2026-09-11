import { test, expect } from "@playwright/test";

const CARD_TITLE = "App store submission";

test.use({ viewport: { width: 1600, height: 1000 } });

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/Email/i).fill("demo@orbit.dev");
  await page.getByLabel(/Password/i).fill("demo1234");
  await page.getByRole("button", { name: /Log in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

async function dragTo(page: import("@playwright/test").Page, title: string, toStatus: string) {
  const source = page.getByText(title, { exact: true });
  const target = page.locator(`[data-status="${toStatus}"]`);

  await expect(source).toBeVisible({ timeout: 15_000 });
  await expect(target).toBeVisible();

  const from = await source.boundingBox();
  const to = await target.boundingBox();
  expect(from, "source card should be measurable").not.toBeNull();
  expect(to, "target column should be measurable").not.toBeNull();

  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  await page.mouse.down();
  await page.mouse.move(to!.x + to!.width / 2, to!.y + 90, { steps: 20 });
  await page.mouse.up();
}

test("drags a task card between kanban columns and persists", async ({ page }) => {
  await login(page);
  await page.goto("/project/prj_mobile");

  // Board + card must be loaded before we measure coordinates
  // (the card starts in the TODO column in the seeded data).
  const patched = page.waitForResponse(
    (res) =>
      res.url().includes("/api/tasks/") &&
      res.request().method() === "PATCH" &&
      res.ok()
  );

  await dragTo(page, CARD_TITLE, "DONE");
  await patched;

  await expect(
    page.locator('[data-status="DONE"]').getByText(CARD_TITLE, { exact: true }),
  ).toBeVisible();

  // Restore so repeated runs stay deterministic.
  const patchedBack = page.waitForResponse(
    (res) =>
      res.url().includes("/api/tasks/") &&
      res.request().method() === "PATCH" &&
      res.ok()
  );

  await dragTo(page, CARD_TITLE, "TODO");
  await patchedBack;

  await expect(
    page.locator('[data-status="TODO"]').getByText(CARD_TITLE, { exact: true }),
  ).toBeVisible();
});