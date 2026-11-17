import { getWatchlistForUser } from "@/lib/data/watchlist";
import { getSessionUser } from "@/lib/auth/session";
import TradingViewWidget from "@/components/TradingViewWidget";
import { SYMBOL_INFO_WIDGET_CONFIG, TRADINGVIEW_SCRIPT_BASE_URL as scriptUrl } from "@/lib/constants";
import Link from "next/link";
import SearchTrigger from "@/components/search/SearchTrigger";


export default async function WatchlistPage() {
  const user = await getSessionUser();
  const items = user ? await getWatchlistForUser(user.id) : [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-100">My Watchlist</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-700 bg-gray-800/30 p-20 text-center">
          <p className="text-gray-500 text-sm mb-2">Your watchlist is empty.</p>
          <SearchTrigger variant="link" label="Browse stocks →" className="text-sm text-yellow-500 hover:underline" />
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