// Raw Finnhub API responses (https://finnhub.io/docs/api), as returned by the
// endpoints called in lib/finnhub/client.ts. Fields Finnhub may omit or send
// as `null` are typed that way, so callers have to handle them.

/** `/quote`. Unknown symbols get an all-zero quote with `d` and `dp` set to `null`. */
export type QuoteResponse = {
  /** Current price. */
  c: number;
  /** Change. */
  d: number | null;
  /** Percent change. */
  dp: number | null;
  /** High price of the day. */
  h: number;
  /** Low price of the day. */
  l: number;
  /** Open price of the day. */
  o: number;
  /** Previous close price. */
  pc: number;
  /** Unix timestamp (seconds). */
  t: number;
};

/** `/stock/profile2`. Unknown symbols get `{}`, hence every field is optional. */
export type ProfileResponse = Partial<{
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  /** In millions of `currency`. */
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}>;

/** `/stock/metric?metric=all`. Only `metric` is read; its values may be `null`. */
export type MetricResponse = {
  symbol?: string;
  metricType?: string;
  metric?: Record<string, number | null>;
};

/** `/stock/market-status?exchange=US`. */
export type MarketStatusResponse = {
  exchange: string;
  /** Holiday name when the exchange is closed for one, else `null`. */
  holiday: string | null;
  isOpen: boolean;
  /** `"pre-market"`, `"regular"`, `"post-market"`, or `null` when closed. */
  session: string | null;
  timezone: string;
  /** Unix timestamp (seconds). */
  t: number;
};

/** One entry of `/search`. */
export type SearchResultItem = {
  symbol: string;
  description: string;
  displaySymbol?: string;
  type: string;
};

/** `/search`. */
export type SearchResponse = {
  count: number;
  result: SearchResultItem[];
};

/** One article of `/news` and `/company-news`; any field may be missing. */
export type NewsArticleResponse = {
  id: number;
  headline?: string;
  summary?: string;
  source?: string;
  url?: string;
  datetime?: number;
  image?: string;
  category?: string;
  related?: string;
};
