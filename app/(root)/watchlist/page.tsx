import type { Metadata } from "next";
import { getWatchlistForUser } from "@/lib/data/watchlist";
import { getSessionUser } from "@/lib/auth/session";
import { getTopStocksData, oldestQuoteTime } from "@/lib/finnhub/client";
import WatchlistEmptyState from "@/components/WatchlistEmptyState";
import WatchlistCard from "@/components/WatchlistCard";
import WatchlistSortableGrid from "@/components/WatchlistSortableGrid";
import AddStockTile from "@/components/AddStockTile";
import MarketDataUnavailable from "@/components/dashboard/MarketDataUnavailable";
import DataTimestamp from "@/components/DataTimestamp";

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
        <h1 className="text-2xl font-bold text-gray-100">Watchlist</h1>
        {items.length > 0 && (
          <p className="text-sm text-gray-500">
            {`${items.length} ${items.length === 1 ? "stock" : "stocks"}`}
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <WatchlistEmptyState />
      ) : (
        <>
          {unavailable ? (
            <MarketDataUnavailable />
          ) : (
            <DataTimestamp time={oldestQuoteTime(stocks)} />
          )}
          <WatchlistSortableGrid
            items={stocks.map((stock) => ({
              symbol: stock.symbol,
              company: stock.company,
              changePercent: stock.changePercent,
              card: <WatchlistCard stock={stock} />,
            }))}
            trailing={<AddStockTile />}
          />
        </>
      )}
    </div>
  );
}
