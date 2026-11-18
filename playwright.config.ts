import { defineConfig, devices } from "@playwright/test";
import {
  APP_PORT,
  APP_URL,
  E2E_AUTH_SECRET,
  E2E_MONGODB_URI,
  EMAIL_OUTBOX_DIR,
  FINNHUB_MOCK_URL,
} from "./e2e/env";

// End-to-end smoke test against a production build (`next build` + `next start`).
//
// Every variable the app reads is set below. Next.js never overrides a
// variable that is already set, so these win over `.env.local`: the tests use
// the test database, the Finnhub mock and dummy credentials, never real ones.
const appEnv = {
  NEXT_TELEMETRY_DISABLED: "1",
  // Separate build directory: the e2e build never replaces `.next`.
  NEXT_DIST_DIR: ".next-e2e",
  MONGODB_URI: E2E_MONGODB_URI,
  BETTER_AUTH_SECRET: E2E_AUTH_SECRET,
  BETTER_AUTH_URL: APP_URL,
  NEXT_PUBLIC_BASE_URL: APP_URL,
  FINNHUB_API_KEY: "e2e-dummy",
  FINNHUB_BASE_URL: FINNHUB_MOCK_URL,
  GEMINI_API_KEY: "e2e-dummy",
  NODEMAILER_EMAIL: "e2e@example.com",
  NODEMAILER_PASSWORD: "e2e-dummy",
  // Emails are written to files, never sent.
  EMAIL_OUTBOX_DIR,
  INNGEST_EVENT_KEY: "e2e-dummy",
  INNGEST_SIGNING_KEY: "e2e-dummy",
  INNGEST_DEV: "1",
};

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  use: {
    baseURL: APP_URL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run build && npx next start --port ${APP_PORT}`,
    url: `${APP_URL}/sign-in`,
    env: appEnv,
    // Never attach to a server already running on the port: it could be
    // using the real database and Finnhub key.
    reuseExistingServer: false,
    timeout: 300_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
