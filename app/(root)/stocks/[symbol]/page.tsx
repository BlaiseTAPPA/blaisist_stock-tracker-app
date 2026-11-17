import TradingViewWidget from "@/components/TradingViewWidget";
import StockChartTabs from "@/components/StockChartTabs";
import WatchlistButton from "@/components/WatchlistButton";
import { isSymbolInWatchlist } from "@/lib/data/watchlist";
import { getSessionUser } from "@/lib/auth/session";
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
  TRADINGVIEW_SCRIPT_BASE_URL as scriptUrl,
} from "@/lib/constants";

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const user = await getSessionUser();
  const inWatchlist = user ? await isSymbolInWatchlist(user.id, symbol.toUpperCase()) : false;

  return (
    <div className="flex flex-col gap-8 min-h-screen p-4 md:p-6 lg:p-8">
      {/* Above the fold, loaded eagerly: symbol info and a single chart. */}
      <section className="flex flex-col-reverse gap-4 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
            height={170}
            lazy={false}
          />
        </div>
        {/* `.watchlist-btn` is `w-full`: give it a fixed width on desktop so it
            doesn't squeeze the symbol-info widget down to zero. */}
        <div className="w-full md:w-60 md:shrink-0">
          <WatchlistButton symbol={symbol.toUpperCase()} company={symbol.toUpperCase()} isInWatchlist={inWatchlist} />
        </div>
      </section>

      <StockChartTabs symbol={symbol} />

      {/* Below the fold: mounted only as they approach the viewport. */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <TradingViewWidget
            scriptUrl={`${scriptUrl}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
            height={400}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}company-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
            height={440}
          />
        </div>

        <TradingViewWidget
          scriptUrl={`${scriptUrl}financials.js`}
          config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
          height={{ base: 560, md: 820 }}
        />
      </section>
    </div>
  );
}
