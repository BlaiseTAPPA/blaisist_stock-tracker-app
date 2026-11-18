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

for (const path of ["/sign-in", "/sign-up", "/forgot-password"]) {
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

// FLOW-10: below `lg` the page itself scrolls; no inner scroll area around
// the form. 640 × 360 is what a 1280 × 720 window shows at 200 % zoom.
for (const viewport of [
  { width: 360, height: 640 },
  { width: 640, height: 360 },
]) {
  test(`/sign-up at ${viewport.width}×${viewport.height} scrolls as one page`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/sign-up");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const layout = await page.evaluate(() => {
      const scrollers = [...document.querySelectorAll<HTMLElement>("body *")].filter((el) => {
        const { overflowY } = getComputedStyle(el);
        return (
          (overflowY === "auto" || overflowY === "scroll") && el.scrollHeight > el.clientHeight + 1
        );
      });
      const root = document.scrollingElement!;
      return {
        nestedScrollers: scrollers.map((el) => el.className),
        pageScrolls: root.scrollHeight > root.clientHeight,
        horizontalOverflow: root.scrollWidth > root.clientWidth,
      };
    });

    expect(layout.nestedScrollers).toEqual([]);
    expect(layout.pageScrolls).toBe(true);
    expect(layout.horizontalOverflow).toBe(false);

    // The submit button is reachable by scrolling the page.
    const submit = page.getByRole("button", { name: "Create account" });
    await submit.scrollIntoViewIfNeeded();
    await expect(submit).toBeInViewport();
  });
}

test("/sign-up works with only name, email and password", async ({ page }) => {
  await page.goto("/sign-up");
  // The optional preferences are collapsed and nothing is pre-selected.
  await expect(page.getByLabel("Risk tolerance")).toBeHidden();
  await page.getByText("Personalize your welcome email (optional)").click();
  await expect(page.getByRole("combobox", { name: "Risk tolerance" })).toHaveText(
    "Select your risk level",
  );
  await expect(page.getByRole("combobox", { name: "Investment goals" })).toHaveText(
    "Select your investment goal",
  );
  expect(await seriousViolations(page)).toEqual([]);

  // Three fields are enough to create the account.
  await page.getByLabel("Full name").fill("Short Form");
  await page.getByLabel("Email").fill("short-form@fingenius.test");
  await page.getByLabel("Password", { exact: true }).fill("short-form-password");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Check your inbox" })).toBeVisible();
});

// Emails and the auth pages load these without a session: the proxy must not
// redirect them to /sign-in.
for (const path of [
  "/favicon.ico",
  "/icon.svg",
  "/apple-icon.png",
  "/assets/icons/logo.svg",
  "/assets/images/logo.png",
  "/assets/images/dashboard-preview.png",
]) {
  test(`${path} is public`, async ({ request }) => {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/^image\//);
  });
}
