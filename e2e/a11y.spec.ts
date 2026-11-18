import { expect, test } from "@playwright/test";
import { seriousViolations } from "./axe";

// Accessibility checks on the public pages: axe-core (WCAG 2.1 A/AA rules)
// and the inline sign-in error (A11Y-02).

test.beforeEach(async ({ context }) => {
  // Same isolation as the smoke test: no third-party requests.
  await context.route(
    (url) => !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(url.href),
    (route) => route.abort(),
  );
});

for (const path of ["/sign-in", "/sign-up"]) {
  test(`${path} has no serious or critical axe violation`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await seriousViolations(page)).toEqual([]);
  });
}

test("a failed sign-in shows an inline alert that stays on screen", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("nobody@fingenius.test");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  const alert = page.getByRole("alert").filter({ hasText: "Incorrect email or password." });
  await expect(alert).toBeVisible();
  // A toast would be gone by now; the inline message stays until the next submit.
  await page.waitForTimeout(10_000);
  await expect(alert).toBeVisible();
  expect(await seriousViolations(page)).toEqual([]);
});
