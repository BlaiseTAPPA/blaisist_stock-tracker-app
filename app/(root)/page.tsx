export const dynamic = 'force-dynamic';

import Link from "next/link";
import TradingViewWidget from "@/components/TradingViewWidget";
import { getTopStocksData, getNews } from "@/lib/actions/finnhub.actions";
import { getWatchlist } from "@/lib/actions/watchlist.actions";
import { MARKET_OVERVIEW_WIDGET_CONFIG } from "@/lib/constants";
import StockLogo from "@/components/StockLogo";
import type { StockWithData } from "@/store/watchlistStore";
import WatchlistGrid from "@/components/WatchlistGrid";



const TOP_STOCKS = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX", "ORCL", "CRM"];
const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;




export default async function Home() {
  const [topStocks, watchlist, news] = await Promise.all([
    getTopStocksData(TOP_STOCKS),
    getWatchlist(),
    getNews(),
  ]);
  const watchlistSymbols = watchlist.map((item) => item.symbol);
const watchlistData = watchlistSymbols.length > 0
  ? await getTopStocksData(watchlistSymbols)
  : [];

  return (
    <div className="flex flex-col gap-10 min-h-screen">

      {/* Row 1 : Market Summary + Watchlist */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Market Summary */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-100">Market Summary</h2>
          <div className="rounded-lg border border-gray-600 bg-gray-800 overflow-hidden">
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
            <Link href="/watchlist" className="text-sm text-gray-500 hover:text-yellow-500 transition-colors">
              View all
            </Link>
          </div>

          {watchlist.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border border-gray-600 bg-gray-800 p-10">
              <p className="text-gray-500 text-sm">No stocks in your watchlist yet.</p>
            </div>
          ) : (
<WatchlistGrid initialData={watchlistData} />
          )}
        </div>
      </div>

      {/* Row 2 : Top Stocks + News */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">

        {/* Top Stocks Table */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-100">Today's Top Stocks</h2>
            <Link href="/search" className="text-sm text-gray-500 hover:text-yellow-500 transition-colors">
              View all
            </Link>
          </div>
          <div className="rounded-lg border border-gray-600 bg-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header-row text-xs uppercase tracking-wider">
                  <th className="py-3 pl-4 text-left font-medium">Company</th>
                  <th className="py-3 px-3 text-left font-medium">Symbol</th>
                  <th className="py-3 px-3 text-right font-medium">Price</th>
                  <th className="py-3 px-3 text-right font-medium">Change</th>
                  <th className="py-3 px-3 text-right font-medium hidden lg:table-cell">Market Cap</th>
                  <th className="py-3 pr-4 text-right font-medium hidden lg:table-cell">P/E</th>
                </tr>
              </thead>
              <tbody>
                {topStocks.map((stock) => (
                  <tr key={stock.symbol} className="table-row">
                    <td className="py-2.5 pl-4 text-gray-300 font-medium truncate max-w-[120px]">
                      <Link href={`/stocks/${stock.symbol}`} className="hover:text-yellow-500 transition-colors">
                        {stock.company}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-gray-400 font-mono text-xs">{stock.symbol}</td>
                    <td className="py-2.5 px-3 text-right text-gray-100 font-medium">{stock.priceFormatted}</td>
                    <td className={`py-2.5 px-3 text-right font-medium ${
                      (stock.changePercent ?? 0) >= 0 ? "text-teal-400" : "text-red-500"
                    }`}>
                      {stock.changeFormatted}
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-400 hidden lg:table-cell">{stock.marketCap}</td>
                    <td className="py-2.5 pr-4 text-right text-gray-400 hidden lg:table-cell">{stock.peRatio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial News */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-100">Today's Financial News</h2>
            <Link href="/news" className="text-sm text-gray-500 hover:text-yellow-500 transition-colors">
              View all
            </Link>
          </div>
          <div className="flex flex-col divide-y divide-gray-700 rounded-lg border border-gray-600 bg-gray-800 overflow-hidden">
            {news.slice(0, 5).map((article, index) => (
              <a
                key={`${article.id}-${index}`}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 mb-1">
                    {article.source} · {new Date(article.datetime * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <p className="text-sm font-semibold text-gray-100 leading-snug line-clamp-2">
                    {article.headline}
                  </p>
                  {article.related && (
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded bg-gray-700 text-[11px] font-mono text-gray-400 border border-gray-600">
                      {article.related}
                    </span>
                  )}
                </div>
                {article.image && (
                  <img
                    src={article.image}
                    alt=""
                    className="w-14 h-14 rounded-md object-cover flex-shrink-0 border border-gray-600"
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