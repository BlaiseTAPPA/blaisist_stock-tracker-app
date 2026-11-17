import Link from "next/link";
import StockLogo from "@/components/StockLogo";
import type { StockWithData } from "@/types/watchlist";

type WatchlistGridProps = {
  stocks: StockWithData[];
};

const GRID_SLOTS = 12;

// Server component: renders the server data directly, so the first paint
// already shows the cards (no store hydration, no empty-slot flash).
const WatchlistGrid = ({ stocks }: WatchlistGridProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: GRID_SLOTS }).map((_, i) => {
        const stock = stocks[i];
        if (stock) {
          return (
            <Link
              key={stock.symbol}
              href={`/stocks/${stock.symbol}`}
              className="rounded-lg border border-gray-600 bg-gray-800 p-3 hover:border-yellow-500/40 transition-colors flex flex-col gap-2"
            >
              <div className="flex items-start justify-between">
                <StockLogo symbol={stock.symbol} />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FACC15" className="w-3.5 h-3.5 flex-shrink-0 mt-1" aria-hidden="true">
                  <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z" />
                </svg>
              </div>
              <p className="text-xs text-gray-300 font-medium truncate">{stock.company}</p>
              <p className="text-base font-bold text-gray-100">{stock.priceFormatted ?? "—"}</p>
              <p className={`text-xs font-medium ${(stock.changePercent ?? 0) >= 0 ? "text-teal-400" : "text-red-500"}`}>
                {stock.changeFormatted ?? "—"}
              </p>
            </Link>
          );
        }

        return (
          <div
            key={`empty-${i}`}
            aria-hidden="true"
            className="rounded-lg border border-dashed border-gray-700 bg-gray-800/30 p-3 min-h-[130px]"
          />
        );
      })}
    </div>
  );
};

export default WatchlistGrid;
