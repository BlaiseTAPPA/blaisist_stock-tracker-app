import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TradingViewWidget from "@/components/TradingViewWidget";
import StockChartTabs from "@/components/StockChartTabs";
import StockLogo from "@/components/StockLogo";
import PriceChange from "@/components/PriceChange";
import WatchlistButton from "@/components/WatchlistButton";
import DataTimestamp from "@/components/DataTimestamp";
import { isSymbolInWatchlist } from "@/lib/data/watchlist";
import { getSessionUser } from "@/lib/auth/session";
import { getStockPageData } from "@/lib/stocks/stock-page";
import { formatPrice } from "@/lib/format";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
  TRADINGVIEW_SCRIPT_BASE_URL as scriptUrl,
} from "@/lib/constants";

export async function generateMetadata({
  params,
}: PageProps<"/stocks/[symbol]">): Promise<Metadata> {
  const { symbol } = await params;
  // Same cached loader as the page: one Finnhub round trip per request.
  const stock = await getStockPageData(symbol);
  if (!stock) return { title: "Symbol not found" };

  const { symbol: sym, name } = stock;
  return {
    title: name ? `${sym} · ${name}` : sym,
    description: `${name ? `${name} (${sym})` : sym} stock price, interactive chart, technical analysis, company profile and financials.`,
  };
}

export default async function StockDetails({ params }: PageProps<"/stocks/[symbol]">) {
  const { symbol } = await params;
  const [stock, user] = await Promise.all([getStockPageData(symbol), getSessionUser()]);
  if (!stock) notFound();

  const { symbol: sym, name, exchange, currency, price, changePercent, quoteTime } = stock;
  const inWatchlist = user ? await isSymbolInWatchlist(user.id, sym) : false;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <StockLogo symbol={sym} />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-gray-100" title={name ?? sym}>
              {name ?? sym}
            </h1>
            <p className="truncate text-sm text-gray-500">
              <span className="font-mono">{sym}</span>
              {exchange && <> · {exchange}</>}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-gray-100 tabular-nums">
                {formatPrice(price, currency)}
              </span>
              <PriceChange value={changePercent} className="text-sm font-medium" />
            </div>
            <DataTimestamp time={quoteTime} />
          </div>
          {/* `.watchlist-btn` is `w-full`: give it a fixed width from `sm` up. */}
          <div className="w-full sm:w-60 sm:shrink-0">
            <WatchlistButton symbol={sym} company={name ?? sym} isInWatchlist={inWatchlist} />
          </div>
        </div>
      </header>

      {/* Above the fold, loaded eagerly: symbol info and a single chart. */}
      <TradingViewWidget
        scriptUrl={`${scriptUrl}symbol-info.js`}
        config={SYMBOL_INFO_WIDGET_CONFIG(sym)}
        height={170}
        lazy={false}
      />

      <StockChartTabs symbol={sym} />

      {/* Below the fold: mounted only as they approach the viewport. */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(sym)}
            height={400}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(sym)}
            height={440}
          />
        </div>

        <TradingViewWidget
          scriptUrl={`${scriptUrl}financials.js`}
          config={COMPANY_FINANCIALS_WIDGET_CONFIG(sym)}
          height={{ base: 560, md: 820 }}
        />
      </section>
    </div>
  );
}
