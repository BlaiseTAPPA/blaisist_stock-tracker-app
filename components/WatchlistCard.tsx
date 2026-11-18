import Link from "next/link";
import StockLogo from "@/components/StockLogo";
import PriceChange from "@/components/PriceChange";
import WatchlistButton from "@/components/WatchlistButton";
import { formatPrice } from "@/lib/format";
import type { StockQuoteRow } from "@/types/stock";

type WatchlistCardProps = {
  stock: StockQuoteRow;
};

/**
 * Watchlist stock card, shared by the dashboard and `/watchlist`.
 *
 * The whole card is clickable through the link's `::after` overlay, but the
 * remove button is a sibling of the link (never nested in it: interactive
 * content inside `<a>` is invalid and steals the click), raised above the
 * overlay with `z-10`. Each control has its own focus ring.
 */
const WatchlistCard = ({ stock }: WatchlistCardProps) => (
  <article className="relative flex h-full min-h-[130px] flex-col gap-2 rounded-lg border border-gray-600 bg-gray-800 p-3 transition-colors hover:border-yellow-500/40">
    <StockLogo symbol={stock.symbol} />

    <Link
      href={`/stocks/${stock.symbol}`}
      className="min-w-0 rounded-sm after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-yellow-500"
    >
      <span className="block truncate text-xs font-medium text-gray-300" title={stock.company}>
        {stock.company}
      </span>
      <span className="block font-mono text-[11px] text-gray-500">{stock.symbol}</span>
    </Link>

    <p className="text-base font-bold text-gray-100 tabular-nums">
      {formatPrice(stock.currentPrice, stock.currency)}
    </p>
    <PriceChange value={stock.changePercent} className="text-xs font-medium" />

    <WatchlistButton
      type="icon"
      symbol={stock.symbol}
      company={stock.company}
      isInWatchlist
      className="absolute top-1 right-1 z-10"
    />
  </article>
);

export default WatchlistCard;
