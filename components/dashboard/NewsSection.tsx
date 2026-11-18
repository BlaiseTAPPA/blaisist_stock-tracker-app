import { getNews } from "@/lib/finnhub/client";
import NewsList from "@/components/NewsList";

// Headlines on the dashboard panel, and on the "Top headlines" tab of `/news`.
const DASHBOARD_NEWS_COUNT = 5;
const NEWS_PAGE_COUNT = 20;

/** General market news (5 latest). `getNews` never throws. */
export default async function NewsSection() {
  const news = await getNews(undefined, { limit: DASHBOARD_NEWS_COUNT });
  return <NewsList articles={news} />;
}

/**
 * The same Finnhub feed on `/news`, longer. Same URL and Data Cache entry as
 * the dashboard panel: no extra Finnhub call within the 5 min cache.
 */
export async function TopHeadlines() {
  const news = await getNews(undefined, { limit: NEWS_PAGE_COUNT });
  return <NewsList articles={news} />;
}
