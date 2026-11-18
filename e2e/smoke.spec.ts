import { expect, test } from "@playwright/test";
import { E2E_USER } from "./seed";
import { FINNHUB_MOCK_PORT } from "./env";

// Smoke test of the main journey: sign in → dashboard → search → stock page →
// add to watchlist → /watchlist → remove → empty state.

const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//;

test.beforeEach(async ({ context }) => {
  // Third-party requests from the browser (TradingView widgets, logos, news
  // images) are blocked: the test must not depend on the network.
  await context.route(
    (url) => !LOCAL.test(url.href),
    (route) => route.abort(),
  );
});

test("sign in, find a stock, add it to the watchlist and remove it", async ({ page, request }) => {
  const finnhubFromBrowser: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("finnhub.io")) finnhubFromBrowser.push(req.url());
  });

  // Sign in
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(E2E_USER.email);
  await page.getByLabel("Password", { exact: true }).fill(E2E_USER.password);
  await page.getByRole("button", { name: /^(log|sign) in$/i }).click();

  // Dashboard
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { level: 1, name: "Dashboard" })).toBeAttached();
  await expect(page.getByRole("heading", { level: 2, name: /popular stocks/i })).toBeVisible();

  // ⌘K / Ctrl+K search, Enter on the first result
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("combobox").fill("AAPL");
  await expect(dialog.getByRole("option", { name: /APPLE INC/ })).toBeVisible();
  await page.keyboard.press("Enter");

  // Stock page
  await expect(page).toHaveURL("/stocks/AAPL");
  await expect(page.getByRole("heading", { level: 1, name: "Apple Inc" })).toBeVisible();

  // Add to the watchlist
  await page.getByRole("button", { name: "Add to watchlist" }).click();
  await expect(page.getByText("AAPL added to your watchlist")).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove from watchlist" })).toBeVisible();

  // /watchlist lists it
  await page.goto("/watchlist");
  await expect(page.getByRole("heading", { level: 1, name: /watchlist/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Apple Inc\s*AAPL/ })).toBeVisible();

  // Remove it: empty state
  await page.getByRole("button", { name: "Remove AAPL from watchlist" }).click();
  await expect(page.getByText("AAPL removed from your watchlist")).toBeVisible();
  await expect(page.getByText(/your watchlist is empty/i)).toBeVisible();

  // Every Finnhub call went to the mock, none to the real API.
  expect(finnhubFromBrowser).toEqual([]);
  const stats = await request.get(`http://127.0.0.1:${FINNHUB_MOCK_PORT}/__stats`);
  expect((await stats.json()).requests).toBeGreaterThan(0);
});
