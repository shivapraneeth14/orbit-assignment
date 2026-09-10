import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  timeout: 60_000,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- -p 3100",
    url: "http://localhost:3100/login",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      PORT: "3100",
      // E2E runs against disposable local Postgres, never Neon/production data.
      DATABASE_URL:
        "postgresql://shivapraneeth@localhost:5432/orbit?schema=public",
      NEXTAUTH_URL: "http://localhost:3100",
      AUTH_TRUST_HOST: "true",
    },
  },
});