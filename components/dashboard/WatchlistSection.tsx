import { getSessionUser } from "@/lib/auth/session";
import { getWatchlistForUser } from "@/lib/data/watchlist";
import { getTopStocksData, oldestQuoteTime } from "@/lib/finnhub/client";
import WatchlistEmptyState from "@/components/WatchlistEmptyState";
import WatchlistGrid, { WATCHLIST_GRID_MAX } from "@/components/WatchlistGrid";
import MarketDataUnavailable from "@/components/dashboard/MarketDataUnavailable";
import DataTimestamp from "@/components/DataTimestamp";

/** Session, then watchlist (DB), then quotes for the cards shown. Streams on its own. */
export default async function WatchlistSection() {
  const user = await getSessionUser();
  const items = user ? await getWatchlistForUser(user.id) : [];

  if (items.length === 0) return <WatchlistEmptyState />;

  // Quotes only for the cards the grid shows (newest first); it needs name,
  // price and change only: no fundamentals.
  const data = await getTopStocksData(items.slice(0, WATCHLIST_GRID_MAX), {
    fundamentals: false,
  });
  const unavailable = data.every((s) => s.status === "unavailable");

  return (
    <>
      {unavailable ? <MarketDataUnavailable /> : <DataTimestamp time={oldestQuoteTime(data)} />}
      <WatchlistGrid stocks={data} total={items.length} />
    </>
  );
}
