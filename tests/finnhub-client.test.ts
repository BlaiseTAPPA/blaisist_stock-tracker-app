import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FinnhubError,
  FinnhubRateLimitError,
  getMarketStatus,
  getNews,
  getStockQuote,
  getTopStocksData,
  oldestQuoteTime,
  searchStocks,
} from "@/lib/finnhub/client";
import type { RawNewsArticle } from "@/types/news";

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });

/** A fetch mock that answers by path (`/quote`, `/company-news`…). */
const routeFetch = (routes: Record<string, (url: URL) => Response | Promise<Response>>) =>
  // Typed with fetch's full signature, so tests can read the options it received.
  vi.fn<(input: string | URL | Request, init?: RequestInit) => Promise<Response>>(async (input) => {
    const url = new URL(String(input));
    const path = url.pathname.replace(/^\/api\/v1/, "");
    const handler = routes[path];
    if (!handler) throw new Error(`unexpected request to ${path}`);
    return handler(url);
  });

const article = (id: number, overrides: Partial<RawNewsArticle> = {}): RawNewsArticle => ({
  id,
  headline: `Headline ${id}`,
  summary: `Summary ${id}`,
  url: `https://news.example.com/${id}`,
  datetime: 1_700_000_000 + id,
  source: "Example",
  category: "general",
  related: "",
  image: "",
  ...overrides,
});

const quote = { c: 190.5, d: 1.2, dp: 0.63, h: 191, l: 188, o: 189, pc: 189.3, t: 1_731_600_000 };

beforeEach(() => {
  vi.stubEnv("FINNHUB_API_KEY", "test-token");
  vi.stubEnv("FINNHUB_BASE_URL", "");
  // Retry jitter at its minimum (300 ms) to keep the suite fast.
  vi.spyOn(Math, "random").mockReturnValue(0);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("fetchJSON (through getStockQuote)", () => {
  it("calls the real API by default, with the token and cache options", async () => {
    const fetchMock = routeFetch({ "/quote": () => json(quote) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getStockQuote("AAPL")).resolves.toEqual(quote);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit & { next?: unknown }];
    expect(url).toBe("https://finnhub.io/api/v1/quote?symbol=AAPL&token=test-token");
    expect(init.cache).toBe("force-cache");
    expect(init.next).toEqual({ revalidate: 60 });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("uses FINNHUB_BASE_URL when set", async () => {
    vi.stubEnv("FINNHUB_BASE_URL", "http://127.0.0.1:4010/api/v1/");
    const fetchMock = routeFetch({ "/quote": () => json(quote) });
    vi.stubGlobal("fetch", fetchMock);

    await getStockQuote("AAPL");

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://127.0.0.1:4010/api/v1/quote?symbol=AAPL&token=test-token",
    );
  });

  it("fails explicitly when the API key is missing", async () => {
    vi.stubEnv("FINNHUB_API_KEY", "");
    vi.stubGlobal("fetch", vi.fn());
    await expect(getStockQuote("AAPL")).rejects.toThrow("FINNHUB_API_KEY is not configured");
  });

  it("throws FinnhubRateLimitError on 429 without retrying", async () => {
    const fetchMock = routeFetch({
      "/quote": () => new Response("slow down", { status: 429, headers: { "retry-after": "30" } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const error = await getStockQuote("AAPL").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(FinnhubRateLimitError);
    expect((error as FinnhubRateLimitError).retryAfterSeconds).toBe(30);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries once on a 5xx, then succeeds", async () => {
    let calls = 0;
    const fetchMock = routeFetch({
      "/quote": () => (++calls === 1 ? new Response("oops", { status: 503 }) : json(quote)),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getStockQuote("AAPL")).resolves.toEqual(quote);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("gives up after the retry and never puts the token in the message", async () => {
    const fetchMock = routeFetch({ "/quote": () => new Response("oops", { status: 502 }) });
    vi.stubGlobal("fetch", fetchMock);

    const error = await getStockQuote("AAPL").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(FinnhubError);
    expect((error as FinnhubError).status).toBe(502);
    expect((error as Error).message).toBe("Finnhub /quote failed: HTTP 502");
    expect((error as Error).message).not.toContain("test-token");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry a 4xx", async () => {
    const fetchMock = routeFetch({ "/quote": () => new Response("no", { status: 403 }) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getStockQuote("AAPL")).rejects.toMatchObject({ status: 403 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports a timeout and retries it", async () => {
    const fetchMock = vi.fn(async () => {
      throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getStockQuote("AAPL")).rejects.toThrow(
      "Finnhub /quote failed: timeout after 5000 ms",
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("reports a network failure without echoing the URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed: https://finnhub.io/api/v1/quote?token=test-token");
      }),
    );

    const error = (await getStockQuote("AAPL").catch((e: unknown) => e)) as FinnhubError;
    expect(error.message).toBe("Finnhub /quote failed: network error");
    expect(error.status).toBeNull();
    expect(error.cause).toBeUndefined();
  });

  it("rejects an invalid JSON body", async () => {
    vi.stubGlobal("fetch", routeFetch({ "/quote": () => new Response("<html>", { status: 200 }) }));
    await expect(getStockQuote("AAPL")).rejects.toThrow("invalid JSON response");
  });

  it("shares one request between identical concurrent calls", async () => {
    const fetchMock = routeFetch({ "/quote": () => json(quote) });
    vi.stubGlobal("fetch", fetchMock);

    const [a, b] = await Promise.all([getStockQuote("AAPL"), getStockQuote("AAPL")]);

    expect(a).toEqual(b);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("getNews", () => {
  it("picks company news round-robin across symbols, newest first, at most 6", async () => {
    const perSymbol: Record<string, RawNewsArticle[]> = {
      AAPL: [1, 2, 3, 4].map((i) => article(100 + i)),
      MSFT: [1, 2, 3, 4].map((i) => article(200 + i)),
      TSLA: [1].map((i) => article(300 + i)),
    };
    const fetchMock = routeFetch({
      "/company-news": (url) => json(perSymbol[url.searchParams.get("symbol") ?? ""] ?? []),
    });
    vi.stubGlobal("fetch", fetchMock);

    const news = await getNews([" aapl ", "MSFT", "tsla", ""]);

    // Round 1: AAPL 101, MSFT 201, TSLA 301; round 2: AAPL 102, MSFT 202; round 3: AAPL 103.
    expect(news.map((n) => n.headline)).toEqual([
      "Headline 301",
      "Headline 202",
      "Headline 201",
      "Headline 103",
      "Headline 102",
      "Headline 101",
    ]);
    expect(new Set(news.map((n) => n.related))).toEqual(new Set(["AAPL", "MSFT", "TSLA"]));
    expect(news.every((n) => n.category === "company")).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("skips invalid articles", async () => {
    vi.stubGlobal(
      "fetch",
      routeFetch({
        "/company-news": () =>
          json([article(1, { headline: "" }), article(2, { url: "" }), article(3)]),
      }),
    );

    const news = await getNews(["AAPL"]);
    expect(news.map((n) => n.headline)).toEqual(["Headline 3"]);
  });

  it("falls back to general news when no company news is found", async () => {
    const fetchMock = routeFetch({
      "/company-news": () => new Response("down", { status: 500 }),
      "/news": () => json([article(1), article(2)]),
    });
    vi.stubGlobal("fetch", fetchMock);

    const news = await getNews(["AAPL"]);
    expect(news.map((n) => n.headline)).toEqual(["Headline 1", "Headline 2"]);
    expect(news[0]?.category).toBe("general");
  });

  it("deduplicates general news and keeps 6", async () => {
    const dup = article(1);
    vi.stubGlobal(
      "fetch",
      routeFetch({
        "/news": () => json([dup, dup, ...[2, 3, 4, 5, 6, 7, 8].map((i) => article(i))]),
      }),
    );

    const news = await getNews();
    expect(news.map((n) => n.headline)).toEqual([1, 2, 3, 4, 5, 6].map((i) => `Headline ${i}`));
  });

  it("returns [] when Finnhub fails", async () => {
    vi.stubGlobal("fetch", routeFetch({ "/news": () => new Response("no", { status: 429 }) }));
    await expect(getNews()).resolves.toEqual([]);
  });
});

describe("searchStocks", () => {
  it("makes no call for an empty query", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await expect(searchStocks("   ")).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps results, uppercases symbols and keeps 15", async () => {
    const result = Array.from({ length: 20 }, (_, i) => ({
      symbol: `sym${i}`,
      description: i === 0 ? "" : `Company ${i}`,
      displaySymbol: `SYM${i}`,
      type: i === 0 ? "" : "Common Stock",
    }));
    const fetchMock = routeFetch({ "/search": () => json({ count: 20, result }) });
    vi.stubGlobal("fetch", fetchMock);

    const found = await searchStocks(" apple ");

    expect(found).toHaveLength(15);
    expect(found[0]).toEqual({ symbol: "SYM0", name: "SYM0", type: "Stock", isInWatchlist: false });
    expect(found[1]).toEqual({
      symbol: "SYM1",
      name: "Company 1",
      type: "Common Stock",
      isInWatchlist: false,
    });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/search?q=apple&token=");
  });

  it("returns [] on error or malformed data", async () => {
    vi.stubGlobal("fetch", routeFetch({ "/search": () => json({ result: "nope" }) }));
    await expect(searchStocks("apple")).resolves.toEqual([]);

    vi.stubGlobal("fetch", routeFetch({ "/search": () => new Response("x", { status: 403 }) }));
    await expect(searchStocks("apple")).resolves.toEqual([]);
  });
});

describe("getMarketStatus", () => {
  it("returns the status", async () => {
    const status = {
      exchange: "US",
      holiday: null,
      isOpen: true,
      session: "regular",
      timezone: "America/New_York",
      t: 1,
    };
    vi.stubGlobal("fetch", routeFetch({ "/stock/market-status": () => json(status) }));
    await expect(getMarketStatus()).resolves.toEqual(status);
  });

  it("returns null for a malformed answer or an error", async () => {
    vi.stubGlobal("fetch", routeFetch({ "/stock/market-status": () => json({}) }));
    await expect(getMarketStatus()).resolves.toBeNull();

    vi.stubGlobal(
      "fetch",
      routeFetch({ "/stock/market-status": () => new Response("", { status: 401 }) }),
    );
    await expect(getMarketStatus()).resolves.toBeNull();
  });
});

describe("getTopStocksData", () => {
  it("combines quote, fundamentals and listing currency", async () => {
    vi.stubGlobal(
      "fetch",
      routeFetch({
        "/quote": () => json(quote),
        "/stock/profile2": () => json({ currency: "EUR" }),
        "/stock/metric": () =>
          json({ metric: { marketCapitalization: 3_000_000, peBasicExclExtraTTM: 0 } }),
      }),
    );

    const [row] = await getTopStocksData([{ symbol: "AAPL", company: "Apple Inc." }]);

    expect(row).toEqual({
      symbol: "AAPL",
      company: "Apple Inc.",
      currency: "EUR",
      currentPrice: 190.5,
      changePercent: 0.63,
      quoteTime: 1_731_600_000,
      marketCapMillions: 3_000_000,
      peRatio: undefined,
      status: "ok",
    });
  });

  it("skips the profile when the currency is known and fundamentals when not asked", async () => {
    const fetchMock = routeFetch({ "/quote": () => json(quote) });
    vi.stubGlobal("fetch", fetchMock);

    const [row] = await getTopStocksData([{ symbol: "AAPL", company: "Apple", currency: "USD" }], {
      fundamentals: false,
    });

    expect(row?.status).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps the price when optional data fails, and marks unknown symbols unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      routeFetch({
        "/quote": (url) =>
          json(url.searchParams.get("symbol") === "AAPL" ? quote : { ...quote, c: 0, dp: null }),
        "/stock/profile2": () => new Response("", { status: 403 }),
        "/stock/metric": () => new Response("", { status: 403 }),
      }),
    );

    const [aapl, unknown] = await getTopStocksData([
      { symbol: "AAPL", company: "Apple" },
      { symbol: "ZZZZ", company: "Nothing" },
    ]);

    expect(aapl).toMatchObject({ status: "ok", currency: "USD", currentPrice: 190.5 });
    expect(unknown).toEqual({
      symbol: "ZZZZ",
      company: "Nothing",
      currency: "USD",
      status: "unavailable",
    });
  });
});

describe("oldestQuoteTime", () => {
  it("returns the stalest quote time, ignoring rows without one", () => {
    expect(
      oldestQuoteTime([
        { symbol: "A", company: "A", currency: "USD", status: "ok", quoteTime: 300 },
        { symbol: "B", company: "B", currency: "USD", status: "unavailable" },
        { symbol: "C", company: "C", currency: "USD", status: "ok", quoteTime: 100 },
      ]),
    ).toBe(100);
    expect(oldestQuoteTime([])).toBeUndefined();
  });
});
