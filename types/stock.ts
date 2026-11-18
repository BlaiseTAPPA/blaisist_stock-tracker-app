export type Stock = {
  symbol: string;
  name: string;
  // Finnhub /search doesn't return the listing exchange.
  exchange?: string;
  type: string;
};

/** A search palette entry. */
export type StockSearchResult = Stock & {
  isInWatchlist: boolean;
};

/** `unavailable`: no usable quote (Finnhub error, timeout, 429 or unknown symbol). */
export type StockDataStatus = "ok" | "unavailable";

/**
 * One row of the dashboard tables and watchlist grid: raw numbers, formatted at
 * render time by `lib/format.ts`. A field is `undefined` when Finnhub has no value.
 */
export type StockQuoteRow = {
  symbol: string;
  company: string;
  /** ISO 4217 code of the listing (Finnhub profile), e.g. "USD". */
  currency: string;
  currentPrice?: number;
  changePercent?: number;
  /** Unix timestamp (seconds) of the quote, Finnhub `quote.t`; `undefined` without a quote. */
  quoteTime?: number;
  /** In millions of `currency`, as Finnhub sends it. */
  marketCapMillions?: number;
  peRatio?: number;
  status: StockDataStatus;
};
