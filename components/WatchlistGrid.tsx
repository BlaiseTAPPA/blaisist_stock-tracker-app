import Link from "next/link";
import StockLogo from "@/components/StockLogo";
import AddStockTile from "@/components/AddStockTile";
import PriceChange from "@/components/PriceChange";
import { formatPrice } from "@/lib/format";
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
            <Link
              href={`/stocks/${stock.symbol}`}
              className="flex h-full flex-col gap-2 rounded-lg border border-gray-600 bg-gray-800 p-3 transition-colors hover:border-yellow-500/40"
            >
              <div className="flex items-start justify-between">
                <StockLogo symbol={stock.symbol} />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#FACC15"
                  className="mt-1 h-3.5 w-3.5 flex-shrink-0"
                  aria-hidden="true"
                >
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z" />
                </svg>
              </div>
              <p className="truncate text-xs font-medium text-gray-300">{stock.company}</p>
              <p className="text-base font-bold text-gray-100 tabular-nums">
                {formatPrice(stock.currentPrice, stock.currency)}
              </p>
              <PriceChange value={stock.changePercent} className="text-xs font-medium" />
            </Link>
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
