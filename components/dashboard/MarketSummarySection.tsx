import TradingViewWidget from "@/components/TradingViewWidget";
import {
  MARKET_OVERVIEW_WIDGET_CONFIG,
  TRADINGVIEW_SCRIPT_BASE_URL as scriptUrl,
} from "@/lib/constants";

// No server data: the TradingView widget loads in the browser behind its own
// placeholder, so this section never suspends and is part of the first HTML
// chunk. A <Suspense> around it would have a fallback that never shows.
const MarketSummarySection = () => (
  <div className="overflow-hidden rounded-lg border border-border bg-surface-raised">
    <TradingViewWidget
      title="Market overview chart"
      scriptUrl={`${scriptUrl}market-overview.js`}
      config={MARKET_OVERVIEW_WIDGET_CONFIG}
      className="custom-chart"
      height={500}
    />
  </div>
);

export default MarketSummarySection;
