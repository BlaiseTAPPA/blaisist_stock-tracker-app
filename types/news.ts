import type { NewsArticleResponse } from "@/types/finnhub";

/** Article as Finnhub returns it, before validation. */
export type RawNewsArticle = NewsArticleResponse;

/** Validated article, as shown on the dashboard and sent to the news email. */
export type MarketNewsArticle = {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number;
  category: string;
  related: string;
  image?: string;
};
