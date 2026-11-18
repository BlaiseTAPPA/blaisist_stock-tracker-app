import { expect, test } from "@playwright/test";
import { E2E_USER } from "./seed";
import { FINNHUB_MOCK_PORT } from "./env";
import { seriousViolations } from "./axe";

// Smoke test of the main journey: sign in → dashboard → add a stock from the
// search palette, by keyboard only → stock page → /watchlist → remove → undo →
// remove → empty state.

const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//;

test.beforeEach(async ({ context }) => {
  // Third-party requests from the browser (TradingView widgets, logos, news
  // images) are blocked: the test must not depend on the network.
  await context.route(
    (url) => !LOCAL.test(url.href),
    (route) => route.abort(),
  );
});

test("sign in, add a stock from the palette, remove it and undo", async ({ page, request }) => {
  const finnhubFromBrowser: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("finnhub.io")) finnhubFromBrowser.push(req.url());
  });

  // Sign in
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(E2E_USER.email);
  await page.getByLabel("Password", { exact: true }).fill(E2E_USER.password);
  await page.getByRole("button", { name: /^(log|sign) in$/i }).click();

  // Dashboard: the watchlist panel is the first one
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText("Your watchlist");
  await expect(page.getByRole("heading", { level: 2, name: /popular stocks/i })).toBeVisible();
  const watchlistPanel = page.getByRole("region", { name: "Your watchlist" });
  await expect(watchlistPanel.getByText(/your watchlist is empty/i)).toBeVisible();

  // ⌘K / Ctrl+K, type AAPL, then Ctrl/⌘+Enter adds the active result
  // without leaving the palette
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox").fill("AAPL");
  const option = dialog.getByRole("option", { name: /APPLE INC/ });
  await expect(option).toBeVisible();
  await expect(dialog.getByText(/add to \/ remove from watchlist/i)).toBeVisible();
  expect(await seriousViolations(page, '[role="dialog"]')).toEqual([]);

  await page.keyboard.press("ControlOrMeta+Enter");
  await expect(dialog.getByRole("status")).toHaveText("AAPL added to your watchlist");
  await expect(option).toHaveAccessibleName(/in your watchlist/);
  await expect(dialog).toBeVisible();

  // Close: the dashboard behind it already shows the new card
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(watchlistPanel.getByRole("link", { name: /APPLE INC\s*AAPL/i })).toBeVisible();
  await expect(watchlistPanel.getByRole("link", { name: "View all (1)" })).toBeVisible();

  // Reopen: the state is read again, AAPL is shown as followed; Enter opens it
  await page.keyboard.press("ControlOrMeta+k");
  await dialog.getByRole("combobox").fill("AAPL");
  await expect(option).toHaveAccessibleName(/in your watchlist/);
  await page.keyboard.press("Enter");

  // Stock page: already in the watchlist
  await expect(page).toHaveURL("/stocks/AAPL");
  await expect(page.getByRole("heading", { level: 1, name: "Apple Inc" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove from watchlist" })).toBeVisible();

  // /watchlist lists it
  await page.goto("/watchlist");
  await expect(page.getByRole("heading", { level: 1, name: /watchlist/i })).toBeVisible();
  const card = page.getByRole("link", { name: /APPLE INC\s*AAPL/i });
  await expect(card).toBeVisible();

  // Remove it, then undo from the toast: the card comes back
  await page.getByRole("button", { name: "Remove AAPL from watchlist" }).click();
  await expect(page.getByText("AAPL removed from your watchlist")).toBeVisible();
  await expect(card).toBeHidden();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("AAPL is back in your watchlist")).toBeVisible();
  await expect(card).toBeVisible();

  // Remove it again: empty state
  await page.getByRole("button", { name: "Remove AAPL from watchlist" }).click();
  await expect(page.getByText(/your watchlist is empty/i)).toBeVisible();

  // Every Finnhub call went to the mock, none to the real API.
  expect(finnhubFromBrowser).toEqual([]);
  const stats = await request.get(`http://127.0.0.1:${FINNHUB_MOCK_PORT}/__stats`);
  expect((await stats.json()).requests).toBeGreaterThan(0);
});
