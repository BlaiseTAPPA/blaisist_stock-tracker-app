import type { Metadata } from "next";
import { getWatchlistForUser } from "@/lib/data/watchlist";
import { getSessionUser } from "@/lib/auth/session";
import { getTopStocksData } from "@/lib/finnhub/client";
import SearchTrigger from "@/components/search/SearchTrigger";
import WatchlistCard from "@/components/WatchlistCard";
import WatchlistSortableGrid from "@/components/WatchlistSortableGrid";
import MarketDataUnavailable from "@/components/dashboard/MarketDataUnavailable";

export const metadata: Metadata = {
  title: "Watchlist",
};

export default async function WatchlistPage() {
  const user = await getSessionUser();
  const items = user ? await getWatchlistForUser(user.id) : [];

  // One batched call for every card: quotes only (no fundamentals), at most
  // 5 symbols in flight, 60 s Data Cache. Replaces one TradingView iframe per stock.
  const stocks = items.length > 0 ? await getTopStocksData(items, { fundamentals: false }) : [];
  const unavailable = stocks.length > 0 && stocks.every((s) => s.status === "unavailable");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="text-2xl font-bold text-gray-100">My watchlist</h1>
        {items.length > 0 && (
          <p className="text-sm text-gray-500">
            {`${items.length} ${items.length === 1 ? "stock" : "stocks"}`}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-700 bg-gray-800/30 p-12 text-center sm:p-20">
          <p className="text-sm text-gray-400">Your watchlist is empty.</p>
          <p className="max-w-sm text-xs text-gray-500">
            Search for a company, open its page and add it to follow its price and daily change.
          </p>
          <SearchTrigger
            variant="link"
            label="Add your first stock"
            className="inline-flex min-h-11 items-center rounded-md bg-yellow-500 px-4 text-sm font-semibold text-gray-900 hover:bg-yellow-400 hover:text-gray-900"
          />
        </div>
      ) : (
        <>
          {unavailable && <MarketDataUnavailable />}
          <WatchlistSortableGrid
            items={stocks.map((stock) => ({
              symbol: stock.symbol,
              company: stock.company,
              changePercent: stock.changePercent,
              card: <WatchlistCard stock={stock} />,
            }))}
          />
        </>
      )}
    </div>
  );
}
