import Link from "next/link";
import TradingViewWidget from "@/components/TradingViewWidget";
import { getTopStocksData, getNews } from "@/lib/finnhub/client";
import { getWatchlistForUser } from "@/lib/data/watchlist";
import { getSessionUser } from "@/lib/auth/session";
import SearchTrigger from "@/components/search/SearchTrigger";
import {
  MARKET_OVERVIEW_WIDGET_CONFIG,
  POPULAR_STOCKS,
  TRADINGVIEW_SCRIPT_BASE_URL as scriptUrl,
} from "@/lib/constants";
import WatchlistGrid, { WATCHLIST_GRID_MAX } from "@/components/WatchlistGrid";
import PriceChange from "@/components/PriceChange";
import { formatMarketCap, formatPrice, formatRatio } from "@/lib/format";

const TOP_STOCKS = POPULAR_STOCKS.map(({ symbol, name, currency }) => ({
  symbol,
  company: name,
  currency,
}));

const MarketDataUnavailable = () => (
  <p role="status" className="text-xs text-gray-500">
    Market data unavailable, please try again in a minute.
  </p>
);

export default async function Home() {
  const user = await getSessionUser();

  // The watchlist quotes chain off the DB read but run in parallel with the
  // top-stocks and news calls, instead of waiting for them.
  const watchlistPromise = (user ? getWatchlistForUser(user.id) : Promise.resolve([])).then(
    async (items) => ({
      items,
      // Quotes only for the cards the grid shows (newest first); it needs
      // name, price and change only: no fundamentals.
      data:
        items.length > 0
          ? await getTopStocksData(items.slice(0, WATCHLIST_GRID_MAX), { fundamentals: false })
          : [],
    }),
  );

  const [topStocks, { items: watchlist, data: watchlistData }, news] = await Promise.all([
    getTopStocksData(TOP_STOCKS),
    watchlistPromise,
    getNews(),
  ]);

  const topStocksUnavailable = topStocks.every((s) => s.status === "unavailable");
  const watchlistUnavailable =
    watchlistData.length > 0 && watchlistData.every((s) => s.status === "unavailable");

  return (
    <div className="flex min-h-screen flex-col gap-10">
      {/* Row 1 : Market Summary + Watchlist */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Market Summary */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-100">Market Summary</h2>
          <div className="overflow-hidden rounded-lg border border-gray-600 bg-gray-800">
            <TradingViewWidget
              scriptUrl={`${scriptUrl}market-overview.js`}
              config={MARKET_OVERVIEW_WIDGET_CONFIG}
              className="custom-chart"
              height={500}
            />
          </div>
        </div>

        {/* Your Watchlist */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-100">Your Watchlist</h2>
            <Link
              href="/watchlist"
              className="text-sm text-gray-500 transition-colors hover:text-yellow-500"
            >
              View all
            </Link>
          </div>

          {watchlist.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border border-gray-600 bg-gray-800 p-10">
              <p className="text-sm text-gray-500">No stocks in your watchlist yet.</p>
            </div>
          ) : (
            <>
              {watchlistUnavailable && <MarketDataUnavailable />}
              <WatchlistGrid stocks={watchlistData} total={watchlist.length} />
            </>
          )}
        </div>
      </div>

      {/* Row 2 : Top Stocks + News */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        {/* Top Stocks Table */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-100">Today&apos;s Top Stocks</h2>
            <SearchTrigger
              variant="link"
              label="Search all stocks"
              className="text-sm text-gray-500"
            />
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-600 bg-gray-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header-row text-xs tracking-wider uppercase">
                  <th className="py-3 pl-4 text-left font-medium">Company</th>
                  <th className="px-3 py-3 text-left font-medium">Symbol</th>
                  <th className="px-3 py-3 text-right font-medium">Price</th>
                  <th className="px-3 py-3 text-right font-medium">Change</th>
                  <th className="hidden px-3 py-3 text-right font-medium lg:table-cell">
                    Market Cap
                  </th>
                  <th className="hidden py-3 pr-4 text-right font-medium lg:table-cell">P/E</th>
                </tr>
              </thead>
              <tbody>
                {topStocks.map((stock) => (
                  <tr key={stock.symbol} className="table-row">
                    <td className="py-2.5 pl-4 font-medium text-gray-300">
                      <Link
                        href={`/stocks/${stock.symbol}`}
                        className="transition-colors hover:text-yellow-500"
                      >
                        <span
                          className="block max-w-[7.5rem] truncate sm:max-w-[14rem]"
                          title={stock.company}
                        >
                          {stock.company}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-gray-400">{stock.symbol}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-gray-100 tabular-nums">
                      {formatPrice(stock.currentPrice, stock.currency)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-medium">
                      <PriceChange value={stock.changePercent} />
                    </td>
                    <td className="hidden px-3 py-2.5 text-right text-gray-400 tabular-nums lg:table-cell">
                      {formatMarketCap(stock.marketCapMillions, stock.currency)}
                    </td>
                    <td className="hidden py-2.5 pr-4 text-right text-gray-400 tabular-nums lg:table-cell">
                      {formatRatio(stock.peRatio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {topStocksUnavailable && <MarketDataUnavailable />}
        </div>

        {/* Financial News */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-100">Today&apos;s Financial News</h2>
            <Link
              href="/news"
              className="text-sm text-gray-500 transition-colors hover:text-yellow-500"
            >
              View all
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-gray-700 overflow-hidden rounded-lg border border-gray-600 bg-gray-800">
            {news.length === 0 && (
              <p role="status" className="p-10 text-center text-sm text-gray-500">
                No news at the moment.
              </p>
            )}
            {news.slice(0, 5).map((article, index) => (
              <a
                key={`${article.id}-${index}`}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 transition-colors hover:bg-gray-700/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-xs text-gray-500">
                    {article.source} ·{" "}
                    {new Date(article.datetime * 1000).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="line-clamp-2 text-sm leading-snug font-semibold text-gray-100">
                    {article.headline}
                  </p>
                  {article.related && (
                    <span className="mt-1.5 inline-flex items-center gap-1 rounded border border-gray-600 bg-gray-700 px-2 py-0.5 font-mono text-[11px] text-gray-400">
                      {article.related}
                    </span>
                  )}
                </div>
                {article.image && (
                  <img
                    src={article.image}
                    alt=""
                    className="h-14 w-14 flex-shrink-0 rounded-md border border-gray-600 object-cover"
                  />
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
