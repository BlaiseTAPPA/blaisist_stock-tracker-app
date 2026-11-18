import AddStockTile from "@/components/AddStockTile";
import WatchlistCard from "@/components/WatchlistCard";
import type { StockQuoteRow } from "@/types/stock";

/** The dashboard shows at most this many watchlist cards. */
export const WATCHLIST_GRID_MAX = 12;

type WatchlistGridProps = {
  /** Cards to render (the caller passes at most WATCHLIST_GRID_MAX). */
  stocks: StockQuoteRow[];
};

// Server component: renders the server data directly, so the first paint
// already shows the cards (no store hydration). Only real items are rendered,
// followed by an "Add stock" tile that opens the search palette. The
// "View all (N)" link is in the panel header.
const WatchlistGrid = ({ stocks }: WatchlistGridProps) => {
  const shown = stocks.slice(0, WATCHLIST_GRID_MAX);

  return (
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
  );
};

export default WatchlistGrid;
