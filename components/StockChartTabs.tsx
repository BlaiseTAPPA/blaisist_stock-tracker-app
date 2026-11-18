"use client";

import { useState } from "react";
import TradingViewWidget from "@/components/TradingViewWidget";
import {
  BASELINE_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  TRADINGVIEW_SCRIPT_BASE_URL,
} from "@/lib/constants";
import { onTablistKeyDown } from "@/lib/a11y/tablist";
import { cn } from "@/lib/utils";

const CHARTS = [
  { id: "candles", label: "Candles", kind: "candlestick", config: CANDLE_CHART_WIDGET_CONFIG },
  { id: "baseline", label: "Baseline", kind: "baseline", config: BASELINE_WIDGET_CONFIG },
] as const;

/** One advanced chart at a time: only the active tab's widget is mounted. */
export default function StockChartTabs({ symbol, name }: { symbol: string; name: string }) {
  const [active, setActive] = useState(0);
  const chart = CHARTS[active] ?? CHARTS[0];

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="Chart type"
        onKeyDown={onTablistKeyDown}
        className="flex gap-2"
      >
        {CHARTS.map((c, i) => (
          <button
            key={c.id}
            id={`chart-tab-${c.id}`}
            type="button"
            role="tab"
            aria-selected={active === i}
            aria-controls="chart-panel"
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              "min-h-11 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium focus-ring transition-colors",
              active === i
                ? "bg-fg text-surface"
                : "bg-surface-raised text-fg-secondary hover:bg-surface-hover",
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div id="chart-panel" role="tabpanel" aria-labelledby={`chart-tab-${chart.id}`}>
        <TradingViewWidget
          key={chart.id}
          title={`${name} ${chart.kind} chart`}
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
