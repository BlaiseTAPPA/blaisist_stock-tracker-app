import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { MongoClient } from "mongodb";
import { createUnsubscribeToken } from "../lib/email/unsubscribe-token";
import { seriousViolations } from "./axe";
import { E2E_AUTH_SECRET, E2E_MONGODB_URI, EMAIL_OUTBOX_DIR } from "./env";
import { E2E_ACCOUNT_USER } from "./seed";

// Account journey (FLOW-02, FLOW-03): forgot password → email → new password
// → sign in → /settings (preferences, digest switch) → unsubscribe link and
// one-click POST. Emails are read from the outbox folder the app writes to.

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ context }) => {
  await context.route(
    (url) => !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url.href),
    (route) => route.abort(),
  );
});

type CapturedEmail = { to: { address: string }[]; subject: string; text: string };

const emailsTo = async (address: string): Promise<CapturedEmail[]> => {
  const files = await readdir(EMAIL_OUTBOX_DIR).catch(() => [] as string[]);
  const emails = await Promise.all(
    files.sort().map(async (file) => {
      const email = JSON.parse(await readFile(join(EMAIL_OUTBOX_DIR, file), "utf8"));
      return email as CapturedEmail;
    }),
  );
  return emails.filter((email) => email.to.some((to) => to.address === address));
};

const digestSwitch = (page: Page) => page.getByRole("switch", { name: "Daily news digest" });

const accountUserId = async (): Promise<string> => {
  const client = new MongoClient(E2E_MONGODB_URI);
  try {
    await client.connect();
    const user = await client.db().collection("user").findOne({ email: E2E_ACCOUNT_USER.email });
    if (!user) throw new Error("Account test user not seeded");
    return user._id.toHexString();
  } finally {
    await client.close();
  }
};

const NEW_PASSWORD = "brand-new-password-456";

test("forgot password answers the same for an unknown address", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL("/forgot-password");
  expect(await seriousViolations(page)).toEqual([]);

  await page.getByLabel("Email").fill("nobody@fingenius.test");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByRole("status")).toContainText(
    "If an account exists for nobody@fingenius.test, we sent it a link to reset the password.",
  );
  // Nothing was sent for an address without an account.
  expect(await emailsTo("nobody@fingenius.test")).toEqual([]);
});

test("reset the password from the emailed link, then sign in with it", async ({ page }) => {
  await page.goto("/forgot-password");
  await page.getByLabel("Email").fill(E2E_ACCOUNT_USER.email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  // Same message as for an unknown address.
  await expect(page.getByRole("status")).toContainText(
    `If an account exists for ${E2E_ACCOUNT_USER.email}, we sent it a link to reset the password.`,
  );

  // The email is sent after the response: wait for it.
  await expect
    .poll(async () => (await emailsTo(E2E_ACCOUNT_USER.email)).length, { timeout: 15_000 })
    .toBe(1);
  const [email] = await emailsTo(E2E_ACCOUNT_USER.email);
  expect(email?.subject).toBe("Reset your FinGenius password");
  const link = email?.text.match(/https?:\/\/\S+\/reset-password\/\S+/)?.[0];
  expect(link).toBeTruthy();

  // Better Auth checks the token, then redirects to the form.
  await page.goto(link!);
  await expect(page).toHaveURL(/\/reset-password\?token=/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Choose a new password" }),
  ).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);

  // Mismatch is caught before anything is sent.
  await page.getByLabel("New password", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Confirm new password").fill("something-else-789");
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page.getByText("The passwords don't match")).toBeVisible();

  await page.getByLabel("Confirm new password").fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Change password" }).click();
  await expect(page).toHaveURL("/sign-in?reset=success");
  await expect(page.getByRole("status")).toContainText("Your password has been changed");

  // The link works once.
  await page.goto(link!);
  await expect(page.getByRole("heading", { level: 1, name: "Reset link expired" })).toBeVisible();

  // Sign in with the new password.
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(E2E_ACCOUNT_USER.email);
  await page.getByLabel("Password", { exact: true }).fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/");

  // /settings from the account menu
  await page.getByRole("button", { name: /account menu$/ }).click();
  await page.getByRole("menuitem", { name: "Settings" }).click();
  await expect(page).toHaveURL("/settings");
  await expect(page.getByRole("heading", { level: 1, name: "Settings" })).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);

  // Preferences: none set at first (short sign-up), then saved and kept.
  await page.getByRole("combobox", { name: "Risk tolerance" }).click();
  await page.getByRole("option", { name: "High" }).click();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByText("Preferences saved")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("combobox", { name: "Risk tolerance" })).toHaveText("High");

  // Digest switch: on by default (field absent), off after a click, kept.
  await expect(digestSwitch(page)).toHaveAttribute("aria-checked", "true");
  await digestSwitch(page).click();
  await expect(page.getByText("Daily digest turned off")).toBeVisible();
  await page.reload();
  await expect(digestSwitch(page)).toHaveAttribute("aria-checked", "false");

  // Back on for the unsubscribe tests.
  await digestSwitch(page).click();
  await expect(page.getByText("Daily digest turned on")).toBeVisible();
  await page.reload();
  await expect(digestSwitch(page)).toHaveAttribute("aria-checked", "true");

  // Unsubscribe link: opening it changes nothing, the button does.
  const token = createUnsubscribeToken(await accountUserId(), "digest", E2E_AUTH_SECRET);
  await page.goto(`/unsubscribe?token=${encodeURIComponent(token)}`);
  await expect(
    page.getByRole("heading", { level: 1, name: "Unsubscribe from the daily digest?" }),
  ).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
  await page.goto("/settings");
  await expect(digestSwitch(page)).toHaveAttribute("aria-checked", "true");

  await page.goto(`/unsubscribe?token=${encodeURIComponent(token)}`);
  await page.getByRole("button", { name: "Unsubscribe" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "You're unsubscribed" })).toBeVisible();
  await page.goto("/settings");
  await expect(digestSwitch(page)).toHaveAttribute("aria-checked", "false");

  // RFC 8058 one-click: the mail client's POST turns it off without a page.
  await digestSwitch(page).click();
  await expect(page.getByText("Daily digest turned on")).toBeVisible();
  const oneClick = await page.request.post(`/api/unsubscribe?token=${encodeURIComponent(token)}`, {
    form: { "List-Unsubscribe": "One-Click" },
  });
  expect(oneClick.status()).toBe(200);
  await page.reload();
  await expect(digestSwitch(page)).toHaveAttribute("aria-checked", "false");

  // A forged token is refused, and GET does nothing.
  const forged = await page.request.post(`/api/unsubscribe?token=${token}x`, {
    form: { "List-Unsubscribe": "One-Click" },
  });
  expect(forged.status()).toBe(400);
  expect((await page.request.get(`/api/unsubscribe?token=${token}`)).status()).toBe(405);
});

test("an invalid unsubscribe or reset link explains what to do", async ({ page }) => {
  await page.goto("/unsubscribe?token=not-a-token");
  await expect(
    page.getByRole("heading", { level: 1, name: "This link doesn't work" }),
  ).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);

  await page.goto("/reset-password?error=INVALID_TOKEN");
  await expect(page.getByRole("heading", { level: 1, name: "Reset link expired" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Request a new link" })).toHaveAttribute(
    "href",
    "/forgot-password",
  );
});
