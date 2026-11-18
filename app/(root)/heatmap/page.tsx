import type { Metadata } from "next";
import TradingViewWidget from "@/components/TradingViewWidget";
import { HEATMAP_WIDGET_CONFIG, TRADINGVIEW_SCRIPT_BASE_URL as scriptUrl } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Heatmap",
  description: "Stock market heatmap: daily performance by sector and market capitalization.",
};

const HeatMapPage = () => {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-100">Stock heatmap</h1>
      <TradingViewWidget
        title="Stock market heatmap by sector and market capitalization"
        scriptUrl={`${scriptUrl}stock-heatmap.js`}
        config={HEATMAP_WIDGET_CONFIG}
        className="custom-chart"
        height={600}
      />
    </section>
  );
};

export default HeatMapPage;
