import "server-only";

import { cache } from "react";
import { getStockProfile, getStockQuote } from "@/lib/finnhub/client";
import { normalizeSymbol } from "@/lib/stocks/symbol";
import type { ProfileResponse, QuoteResponse } from "@/types/finnhub";

export type StockPageData = {
  /** Normalized ticker, e.g. "AAPL". */
  symbol: string;
  /** Company name from the profile; `undefined` for symbols without one (ETFs, crypto). */
  name?: string;
  exchange?: string;
  /** Listing currency (ISO 4217); defaults to USD when the profile has none. */
  currency: string;
  /** Current price; `undefined` when the quote is empty or unavailable. */
  price?: number;
  /** Percent change; `undefined` when the quote is empty or unavailable. */
  changePercent?: number;
};

const DEFAULT_CURRENCY = "USD";

// `null` means the call failed (timeout, 429, 5xx), which is not the same as
// Finnhub answering that it doesn't know the symbol.
const settle = <T>(promise: Promise<T>): Promise<T | null> => promise.catch(() => null);

const isEmptyProfile = (profile: ProfileResponse) => !profile.name && !profile.ticker;
// Finnhub answers unknown symbols with an all-zero quote.
const isEmptyQuote = (quote: QuoteResponse) => !quote.c;

/**
 * Data for the stock page header and its metadata, or `null` when the param is
 * not a symbol or Finnhub knows neither a profile nor a quote for it.
 *
 * Wrapped in React `cache` so `generateMetadata` and the page share one call
 * per request: the Finnhub client passes an abort `signal`, which opts its
 * requests out of Next's automatic `fetch` memoization. The profile (24 h) and
 * quote (60 s) are also kept in the Data Cache.
 */
export const getStockPageData = cache(async (rawSymbol: string): Promise<StockPageData | null> => {
  const symbol = normalizeSymbol(rawSymbol);
  if (!symbol) return null;

  const [profile, quote] = await Promise.all([
    settle(getStockProfile(symbol)),
    settle(getStockQuote(symbol)),
  ]);

  // Some valid symbols (ETFs, crypto) have no profile: only give up when both
  // answers are empty. A failed call is an outage, not a 404: keep the page.
  if (profile && quote && isEmptyProfile(profile) && isEmptyQuote(quote)) return null;

  const hasQuote = quote !== null && !isEmptyQuote(quote);

  return {
    symbol,
    name: profile?.name || undefined,
    exchange: profile?.exchange || undefined,
    currency: profile?.currency || DEFAULT_CURRENCY,
    price: hasQuote ? quote.c : undefined,
    changePercent: hasQuote ? (quote.dp ?? undefined) : undefined,
  };
});
