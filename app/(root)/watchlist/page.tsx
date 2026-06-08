export const dynamic = 'force-dynamic';

import { getWatchlist } from "@/lib/actions/watchlist.actions";
import TradingViewWidget from "@/components/TradingViewWidget";
import { SYMBOL_INFO_WIDGET_CONFIG } from "@/lib/constants";
import Link from "next/link";

const scriptUrl = "https://s3.tradingview.com/external-embedding/embed-widget-";

export default async function WatchlistPage() {
  const items = await getWatchlist();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">My Watchlist</h1>
        {/* <span className="text-sm text-gray-500">{items.length} stock{items.length !== 1 ? 's' : ''}</span> */}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-800/30 p-20 text-center">
          <p className="text-gray-500 text-sm mb-2">Your watchlist is empty.</p>
          <Link href="/search" className="text-sm text-yellow-500 hover:underline">
            Browse stocks →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item.symbol}
              href={`/stocks/${item.symbol}`}
              className="rounded-lg border border-gray-600 bg-gray-800 overflow-hidden hover:border-yellow-500/40 transition-colors"
            >
              <TradingViewWidget
                scriptUrl={`${scriptUrl}symbol-info.js`}
                config={{
                  ...SYMBOL_INFO_WIDGET_CONFIG(item.symbol),
                  height: 170,
                }}
                height={170}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}