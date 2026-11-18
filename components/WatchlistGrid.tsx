import Link from "next/link";
import AddStockTile from "@/components/AddStockTile";
import WatchlistCard from "@/components/WatchlistCard";
import type { StockQuoteRow } from "@/types/stock";

/** The dashboard shows at most this many watchlist cards. */
export const WATCHLIST_GRID_MAX = 12;

type WatchlistGridProps = {
  /** Cards to render (the caller passes at most WATCHLIST_GRID_MAX). */
  stocks: StockQuoteRow[];
  /** Size of the whole watchlist, for the "View all (N)" link. */
  total: number;
};

// Server component: renders the server data directly, so the first paint
// already shows the cards (no store hydration). Only real items are rendered,
// followed by an "Add stock" tile that opens the search palette.
const WatchlistGrid = ({ stocks, total }: WatchlistGridProps) => {
  const shown = stocks.slice(0, WATCHLIST_GRID_MAX);

  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {shown.map((stock) => (
          <li key={stock.symbol} className="min-w-0">
            <WatchlistCard stock={stock} />
          </li>
        ))}
        <li className="min-w-0">
          <AddStockTile />
        </li>
      </ul>

      {total > WATCHLIST_GRID_MAX && (
        <Link
          href="/watchlist"
          className="inline-flex min-h-11 items-center self-end text-sm text-gray-400 transition-colors hover:text-yellow-500"
        >
          View all ({total})
        </Link>
      )}
    </div>
  );
};

export default WatchlistGrid;
