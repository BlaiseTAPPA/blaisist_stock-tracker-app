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

/** One row of the dashboard tables, built from a quote (and optional fundamentals). */
export type StockQuoteRow = {
  symbol: string;
  company: string;
  currentPrice?: number;
  changePercent?: number;
  priceFormatted: string;
  changeFormatted: string;
  marketCap: string;
  peRatio: string;
  status: StockDataStatus;
};
