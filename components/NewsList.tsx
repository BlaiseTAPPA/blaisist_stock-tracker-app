import type { MarketNewsArticle } from "@/types/news";
import RelativeTime from "@/components/RelativeTime";

/**
 * Finnhub headlines as a list of external links. Shared by the dashboard
 * "Financial news" panel and the "Top headlines" tab of `/news`, so both show
 * the same feed in the same way.
 */
export default function NewsList({ articles }: { articles: MarketNewsArticle[] }) {
  return (
    <div className="flex flex-col divide-y divide-gray-700 overflow-hidden rounded-lg border border-gray-600 bg-gray-800">
      {articles.length === 0 && (
        <p role="status" className="p-10 text-center text-sm text-gray-500">
          No news at the moment.
        </p>
      )}
      {articles.map((article, index) => (
        <a
          key={`${article.id}-${index}`}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          // Inset ring: the list container clips anything drawn outside the rows.
          className="flex items-start gap-4 p-4 transition-colors hover:bg-gray-700/50 focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:outline-none focus-visible:ring-inset"
        >
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-xs text-gray-500">
              {article.source} · <RelativeTime time={article.datetime} />
            </p>
            <p className="line-clamp-2 text-sm leading-snug font-semibold text-gray-100">
              {article.headline}
              <span className="sr-only"> (opens in a new tab)</span>
            </p>
            {article.related && (
              <span className="mt-1.5 inline-flex items-center gap-1 rounded border border-gray-600 bg-gray-700 px-2 py-0.5 font-mono text-[11px] text-gray-400">
                {article.related}
              </span>
            )}
          </div>
          {article.image && (
            // Thumbnails come from arbitrary publisher domains, which can't all
            // be listed in `images.remotePatterns`: a plain <img>, sized, lazy,
            // and sending no Referer to the publisher.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image}
              alt=""
              width={56}
              height={56}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="h-14 w-14 shrink-0 rounded-md border border-gray-600 object-cover"
            />
          )}
        </a>
      ))}
    </div>
  );
}
