import Link from "next/link";
import { getTopStocksData } from "@/lib/finnhub/client";
import { POPULAR_STOCKS } from "@/lib/constants";
import PriceChange from "@/components/PriceChange";
import MarketDataUnavailable from "@/components/dashboard/MarketDataUnavailable";
import { formatMarketCap, formatPrice, formatRatio } from "@/lib/format";

const TOP_STOCKS = POPULAR_STOCKS.map(({ symbol, name, currency }) => ({
  symbol,
  company: name,
  currency,
}));

/** Quotes and fundamentals for the static popular-stocks list. */
export default async function PopularStocksSection() {
  const topStocks = await getTopStocksData(TOP_STOCKS);
  const unavailable = topStocks.every((s) => s.status === "unavailable");

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-600 bg-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header-row text-xs tracking-wider uppercase">
              <th className="py-3 pl-4 text-left font-medium">Company</th>
              <th className="px-3 py-3 text-left font-medium">Symbol</th>
              <th className="px-3 py-3 text-right font-medium">Price</th>
              <th className="px-3 py-3 text-right font-medium">Change</th>
              <th className="hidden px-3 py-3 text-right font-medium lg:table-cell">Market Cap</th>
              <th className="hidden py-3 pr-4 text-right font-medium lg:table-cell">P/E</th>
            </tr>
          </thead>
          <tbody>
            {topStocks.map((stock) => (
              <tr key={stock.symbol} className="table-row">
                <td className="py-2.5 pl-4 font-medium text-gray-300">
                  <Link
                    href={`/stocks/${stock.symbol}`}
                    className="rounded-sm focus-ring transition-colors hover:text-yellow-500"
                  >
                    <span
                      className="block max-w-[7.5rem] truncate sm:max-w-[14rem]"
                      title={stock.company}
                    >
                      {stock.company}
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-gray-400">{stock.symbol}</td>
                <td className="px-3 py-2.5 text-right font-medium text-gray-100 tabular-nums">
                  {formatPrice(stock.currentPrice, stock.currency)}
                </td>
                <td className="px-3 py-2.5 text-right font-medium">
                  <PriceChange value={stock.changePercent} />
                </td>
                <td className="hidden px-3 py-2.5 text-right text-gray-400 tabular-nums lg:table-cell">
                  {formatMarketCap(stock.marketCapMillions, stock.currency)}
                </td>
                <td className="hidden py-2.5 pr-4 text-right text-gray-400 tabular-nums lg:table-cell">
                  {formatRatio(stock.peRatio)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {unavailable && <MarketDataUnavailable />}
    </>
  );
}
