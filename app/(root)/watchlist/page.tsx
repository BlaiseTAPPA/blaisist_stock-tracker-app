import { getWatchlist } from "@/lib/actions/watchlist.actions";
import TradingViewWidget from "@/components/TradingViewWidget";
import WatchlistButton from "@/components/WatchlistButton";
import { SYMBOL_INFO_WIDGET_CONFIG } from "@/lib/constants";
import Link from "next/link";

const scriptUrl = "https://s3.tradingview.com/external-embedding/embed-widget-";

export default async function WatchlistPage() {
  const items = await getWatchlist();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Watchlist</h1>

      {items.length === 0 ? (
        <p className="text-gray-400">Your watchlist is empty. Browse stocks and add some!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.symbol} className="flex flex-col gap-2">
{/*               <div className="flex items-center justify-between px-1">
                <Link
                  href={`/stocks/${item.symbol}`}
                  className="text-yellow-500 hover:underline font-medium text-sm"
                >
                  View {item.symbol}
                </Link>
                <WatchlistButton
                  symbol={item.symbol}
                  company={item.company}
                  isInWatchlist={true}
                  showTrashIcon={false}
                />
              </div> */}
              <TradingViewWidget
                scriptUrl={`${scriptUrl}symbol-info.js`}
                config={SYMBOL_INFO_WIDGET_CONFIG(item.symbol)}
                height={170}
              />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}