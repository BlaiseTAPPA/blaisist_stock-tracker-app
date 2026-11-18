import "server-only";

import { getDateRange, validateArticle, formatArticle } from "@/lib/utils";
import { mapWithConcurrency } from "@/lib/map-with-concurrency";
import { FinnhubError, FinnhubRateLimitError } from "@/lib/finnhub/errors";
import { enableFinnhubCallCounter } from "@/lib/finnhub/debug";
import type {
  MarketStatusResponse,
  MetricResponse,
  ProfileResponse,
  QuoteResponse,
  SearchResponse,
  SearchResultItem,
} from "@/types/finnhub";
import type { MarketNewsArticle, RawNewsArticle } from "@/types/news";
import type { StockQuoteRow, StockSearchResult } from "@/types/stock";

export { FinnhubError, FinnhubRateLimitError };

const DEFAULT_FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

// Overridable so the end-to-end tests can point the app at a local mock
// server instead of spending the real quota. Read on every call, like the token.
const getFinnhubBaseUrl = () =>
  (process.env.FINNHUB_BASE_URL || DEFAULT_FINNHUB_BASE_URL).replace(/\/+$/, "");

// Data Cache lifetimes, in seconds.
const REVALIDATE = {
  quote: 60,
  profile: 86_400,
  metric: 86_400,
  news: 300,
  search: 1_800,
  marketStatus: 60,
} as const;

const REQUEST_TIMEOUT_MS = 5_000;

enableFinnhubCallCounter();

// Read on every call (not at module load) so a missing key fails the request
// with an explicit message instead of crashing the build.
function getFinnhubToken(): string {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    throw new Error("FINNHUB_API_KEY is not configured");
  }
  return token;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const retryJitterMs = () => 300 + Math.floor(Math.random() * 500); // 300–800 ms

function isRetryable(err: unknown): boolean {
  if (err instanceof FinnhubRateLimitError) return false; // never hammer a 429
  if (err instanceof FinnhubError) return err.status === null || err.status >= 500;
  return false;
}

function retryAfterSeconds(res: Response): number | null {
  const value = Number(res.headers.get("retry-after"));
  return Number.isFinite(value) && value > 0 ? value : null;
}

async function fetchOnce<T>(url: string, endpoint: string, revalidateSeconds: number): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: revalidateSeconds },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    // Timeout (TimeoutError) or network failure. Don't wrap the original
    // error as `cause`: its message may echo the URL.
    const timedOut = err instanceof Error && err.name === "TimeoutError";
    throw new FinnhubError(
      endpoint,
      null,
      timedOut ? `timeout after ${REQUEST_TIMEOUT_MS} ms` : "network error",
    );
  }

  if (res.status === 429) {
    await res.body?.cancel().catch(() => {});
    throw new FinnhubRateLimitError(endpoint, retryAfterSeconds(res));
  }
  if (!res.ok) {
    await res.body?.cancel().catch(() => {});
    throw new FinnhubError(endpoint, res.status);
  }

  try {
    return (await res.json()) as T;
  } catch {
    throw new FinnhubError(endpoint, res.status, "invalid JSON response");
  }
}

// Passing `signal` opts the request out of Next's per-render fetch
// memoization (see next/dist/server/lib/dedupe-fetch.js), so identical
// in-flight requests are shared here instead. Entries live only while the
// request is pending; the Data Cache (`force-cache` + `revalidate`) still
// applies.
const inFlight = new Map<string, Promise<unknown>>();

// Internal only: never export this, it fetches whatever URL it is given.
// `path` is relative to the API base and must not contain the token; the
// token is appended here.
async function fetchJSON<T>(path: string, revalidateSeconds: number): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const url = `${getFinnhubBaseUrl()}${path}${separator}token=${getFinnhubToken()}`;
  const [endpoint = path] = path.split("?");

  const pending = inFlight.get(url);
  if (pending) return pending as Promise<T>;

  const request = (async () => {
    try {
      return await fetchOnce<T>(url, endpoint, revalidateSeconds);
    } catch (err) {
      if (!isRetryable(err)) throw err;
      await sleep(retryJitterMs());
      return fetchOnce<T>(url, endpoint, revalidateSeconds);
    }
  })();

  inFlight.set(url, request);
  try {
    return await request;
  } finally {
    inFlight.delete(url);
  }
}

export async function getStockQuote(symbol: string): Promise<QuoteResponse> {
  return fetchJSON<QuoteResponse>(`/quote?symbol=${encodeURIComponent(symbol)}`, REVALIDATE.quote);
}

export async function getStockProfile(symbol: string): Promise<ProfileResponse> {
  return fetchJSON<ProfileResponse>(
    `/stock/profile2?symbol=${encodeURIComponent(symbol)}`,
    REVALIDATE.profile,
  );
}

export async function getStockFinancials(symbol: string): Promise<MetricResponse> {
  return fetchJSON<MetricResponse>(
    `/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all`,
    REVALIDATE.metric,
  );
}

/**
 * US market state (open, pre-market, after hours, closed, holiday): one call
 * per minute at most (60 s Data Cache), shared by every viewer. Never throws:
 * returns `null` when Finnhub is unavailable, so the badge is just left out.
 */
export async function getMarketStatus(): Promise<MarketStatusResponse | null> {
  try {
    const status = await fetchJSON<MarketStatusResponse>(
      "/stock/market-status?exchange=US",
      REVALIDATE.marketStatus,
    );
    return typeof status?.isOpen === "boolean" ? status : null;
  } catch {
    return null;
  }
}

const MAX_CONCURRENT_SYMBOLS = 5;

/**
 * `currency` is the listing currency when the caller already knows it (static
 * list); otherwise it is read from `/stock/profile2` (24 h cache).
 */
type StockInput = { symbol: string; company: string; currency?: string };

// Finnhub's profile has no currency for unknown symbols, and the profile call
// may fail: US listings are the common case, so fall back to USD.
const DEFAULT_CURRENCY = "USD";

/** Finnhub sends `null` for missing metrics and `0` for unknown ones. */
const nonZeroOrUndefined = (value: number | null | undefined) =>
  typeof value === "number" && Number.isFinite(value) && value !== 0 ? value : undefined;

/**
 * Quote (60 s cache) for each stock, plus `/stock/metric` (24 h cache) for the
 * P/E and market cap when `fundamentals` is true, plus `/stock/profile2`
 * (24 h cache) for the listing currency when the caller doesn't pass one.
 * Company names come from the caller (static list or watchlist document).
 * Cold cost per symbol: 1 call, +1 with fundamentals, +1 without a known
 * currency; at most 5 symbols in flight.
 */
export async function getTopStocksData(
  stocks: readonly StockInput[],
  { fundamentals = true }: { fundamentals?: boolean } = {},
): Promise<StockQuoteRow[]> {
  return mapWithConcurrency(
    stocks,
    MAX_CONCURRENT_SYMBOLS,
    async ({ symbol, company, currency }) => {
      // Optional data: a failure there must not hide the price.
      const profilePromise = currency
        ? Promise.resolve(null)
        : getStockProfile(symbol).catch(() => null);
      const financialsPromise = fundamentals
        ? getStockFinancials(symbol).catch(() => null)
        : Promise.resolve(null);

      try {
        const [quote, profile, financials] = await Promise.all([
          getStockQuote(symbol),
          profilePromise,
          financialsPromise,
        ]);

        // Finnhub answers unknown symbols with an all-zero quote.
        if (!quote.c) throw new Error("empty quote");

        return {
          symbol,
          company,
          currency: currency ?? (profile?.currency || DEFAULT_CURRENCY),
          currentPrice: quote.c,
          changePercent: quote.dp ?? undefined,
          quoteTime: quote.t || undefined,
          marketCapMillions: nonZeroOrUndefined(financials?.metric?.["marketCapitalization"]),
          peRatio: nonZeroOrUndefined(financials?.metric?.["peBasicExclExtraTTM"]),
          status: "ok",
        } satisfies StockQuoteRow;
      } catch {
        return {
          symbol,
          company,
          currency: currency ?? DEFAULT_CURRENCY,
          status: "unavailable",
        } satisfies StockQuoteRow;
      }
    },
  );
}

/**
 * Oldest quote time (Unix seconds) among the rows that have a quote: the
 * "as of" of a block of prices is only as fresh as its stalest price.
 */
export function oldestQuoteTime(rows: readonly StockQuoteRow[]): number | undefined {
  const times = rows.flatMap((row) => (row.quoteTime ? [row.quoteTime] : []));
  return times.length > 0 ? Math.min(...times) : undefined;
}

/** Never throws: returns `[]` when Finnhub is unavailable. */
/** General news are de-duplicated and capped at this many before slicing. */
const MAX_GENERAL_NEWS = 20;

/**
 * `limit` (default 6, at most 20): number of articles returned. General news
 * always come from the same `/news?category=general` URL and 5 min Data Cache
 * entry, whatever the limit: the dashboard (5) and `/news` (20) share it.
 */
export async function getNews(
  symbols?: string[],
  { limit = 6 }: { limit?: number } = {},
): Promise<MarketNewsArticle[]> {
  try {
    const range = getDateRange(5);
    const cleanSymbols = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    const maxArticles = Math.min(Math.max(1, Math.floor(limit)), MAX_GENERAL_NEWS);

    // If we have symbols, try to fetch company news per symbol and round-robin select
    if (cleanSymbols.length > 0) {
      const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

      await Promise.all(
        cleanSymbols.map(async (sym) => {
          try {
            const path = `/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}`;
            const articles = await fetchJSON<RawNewsArticle[]>(path, REVALIDATE.news);
            perSymbolArticles[sym] = (articles || []).filter(validateArticle);
          } catch (e) {
            console.error("Error fetching company news for", sym, e);
            perSymbolArticles[sym] = [];
          }
        }),
      );

      const collected: MarketNewsArticle[] = [];
      // Round-robin up to `maxArticles` picks
      for (let round = 0; round < maxArticles; round++) {
        for (const sym of cleanSymbols) {
          const list = perSymbolArticles[sym] || [];
          if (list.length === 0) continue;
          const article = list.shift();
          if (!article || !validateArticle(article)) continue;
          collected.push(formatArticle(article, true, sym, round));
          if (collected.length >= maxArticles) break;
        }
        if (collected.length >= maxArticles) break;
      }

      if (collected.length > 0) {
        // Sort by datetime desc
        collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
        return collected.slice(0, maxArticles);
      }
      // If none collected, fall through to general news
    }

    // General market news fallback or when no symbols provided
    const general = await fetchJSON<RawNewsArticle[]>("/news?category=general", REVALIDATE.news);

    const seen = new Set<string>();
    const unique: RawNewsArticle[] = [];
    for (const art of general || []) {
      if (!validateArticle(art)) continue;
      const key = `${art.id}-${art.url}-${art.headline}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(art);
      if (unique.length >= MAX_GENERAL_NEWS) break; // cap early before final slicing
    }

    const formatted = unique
      .slice(0, maxArticles)
      .map((a, idx) => formatArticle(a, false, undefined, idx));
    return formatted;
  } catch (err) {
    console.error("getNews error:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  try {
    const trimmed = query.trim();
    // Default results (empty query) come from the static POPULAR_STOCKS list,
    // rendered by the Header without any Finnhub call.
    if (!trimmed) return [];

    const data = await fetchJSON<SearchResponse>(
      `/search?q=${encodeURIComponent(trimmed)}`,
      REVALIDATE.search,
    );
    const results: SearchResultItem[] = Array.isArray(data?.result) ? data.result : [];

    const mapped: StockSearchResult[] = results
      .map((r) => {
        const upper = (r.symbol || "").toUpperCase();
        const name = r.description || upper;
        const type = r.type || "Stock";
        // `/search` has no exchange field (`displaySymbol` is the ticker again),
        // so `exchange` is left out rather than showing the symbol twice.
        const item: StockSearchResult = {
          symbol: upper,
          name,
          type,
          isInWatchlist: false,
        };
        return item;
      })
      .slice(0, 15);

    return mapped;
  } catch (err) {
    console.error("Error in stock search:", err);
    return [];
  }
}
