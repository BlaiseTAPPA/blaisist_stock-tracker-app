import { cache } from "react";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { getWatchlistForUser } from "@/lib/data/watchlist";
import { getTopStocksData, oldestQuoteTime } from "@/lib/finnhub/client";
import WatchlistEmptyState from "@/components/WatchlistEmptyState";
import WatchlistGrid, { WATCHLIST_GRID_MAX } from "@/components/WatchlistGrid";
import MarketDataUnavailable from "@/components/dashboard/MarketDataUnavailable";
import DataTimestamp from "@/components/DataTimestamp";

// Read once per request: the section and the "View all (N)" link in the panel
// header both need the list, from two separate Suspense boundaries.
const getCurrentWatchlist = cache(async () => {
  const user = await getSessionUser();
  return user ? getWatchlistForUser(user.id) : [];
});

/** "View all (N)" in the panel header; nothing while the watchlist is empty. */
export async function WatchlistViewAllLink({ className }: { className?: string }) {
  const items = await getCurrentWatchlist();
  if (items.length === 0) return null;

  return (
    <Link href="/watchlist" className={className}>
      View all ({items.length})
    </Link>
  );
}

/** Session, then watchlist (DB), then quotes for the cards shown. Streams on its own. */
export default async function WatchlistSection() {
  const items = await getCurrentWatchlist();

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
      <WatchlistGrid stocks={data} />
    </>
  );
}
