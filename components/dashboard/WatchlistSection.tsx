import { getSessionUser } from "@/lib/auth/session";
import { getWatchlistForUser } from "@/lib/data/watchlist";
import { getTopStocksData } from "@/lib/finnhub/client";
import SearchTrigger from "@/components/search/SearchTrigger";
import WatchlistGrid, { WATCHLIST_GRID_MAX } from "@/components/WatchlistGrid";
import MarketDataUnavailable from "@/components/dashboard/MarketDataUnavailable";

/** Session, then watchlist (DB), then quotes for the cards shown. Streams on its own. */
export default async function WatchlistSection() {
  const user = await getSessionUser();
  const items = user ? await getWatchlistForUser(user.id) : [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-600 bg-gray-800/30 p-10 text-center">
        <p className="text-sm text-gray-400">No stocks in your watchlist yet.</p>
        <p className="max-w-xs text-xs text-gray-500">
          Follow the stocks you care about to see their price and daily change here.
        </p>
        <SearchTrigger
          variant="link"
          label="Add your first stock"
          className="inline-flex min-h-11 items-center rounded-md bg-yellow-500 px-4 text-sm font-semibold text-gray-900 hover:bg-yellow-400 hover:text-gray-900"
        />
      </div>
    );
  }

  // Quotes only for the cards the grid shows (newest first); it needs name,
  // price and change only: no fundamentals.
  const data = await getTopStocksData(items.slice(0, WATCHLIST_GRID_MAX), {
    fundamentals: false,
  });
  const unavailable = data.every((s) => s.status === "unavailable");

  return (
    <>
      {unavailable && <MarketDataUnavailable />}
      <WatchlistGrid stocks={data} total={items.length} />
    </>
  );
}
