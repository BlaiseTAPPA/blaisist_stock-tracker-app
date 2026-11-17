"use client";

import { useState } from "react";
import TradingViewWidget from "@/components/TradingViewWidget";
import {
  BASELINE_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  TRADINGVIEW_SCRIPT_BASE_URL,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

const CHARTS = [
  { id: "candles", label: "Candles", config: CANDLE_CHART_WIDGET_CONFIG },
  { id: "baseline", label: "Baseline", config: BASELINE_WIDGET_CONFIG },
] as const;

/** One advanced chart at a time: only the active tab's widget is mounted. */
export default function StockChartTabs({ symbol }: { symbol: string }) {
  const [active, setActive] = useState(0);
  const chart = CHARTS[active];

  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Chart type" className="flex gap-2">
        {CHARTS.map((c, i) => (
          <button
            key={c.id}
            id={`chart-tab-${c.id}`}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-controls="chart-panel"
            onClick={() => setActive(i)}
            className={cn(
              "min-h-11 sm:min-h-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
              active === i
                ? "bg-yellow-500 text-black"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div id="chart-panel" role="tabpanel" aria-labelledby={`chart-tab-${chart.id}`}>
        <TradingViewWidget
          key={chart.id}
          scriptUrl={`${TRADINGVIEW_SCRIPT_BASE_URL}advanced-chart.js`}
          config={chart.config(symbol)}
          className="custom-chart"
          height={{ base: 380, md: 600 }}
          lazy={false}
        />
      </div>
    </div>
  );
}
