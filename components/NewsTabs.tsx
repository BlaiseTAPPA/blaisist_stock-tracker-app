"use client";

import { useState } from "react";
import TradingViewWidget from "@/components/TradingViewWidget";
import {
  NEWS_INDUSTRIES,
  getNewsWidgetConfig,
  TRADINGVIEW_SCRIPT_BASE_URL as scriptUrl,
} from "@/lib/constants";
import { onTablistKeyDown } from "@/lib/a11y/tablist";
import { cn } from "@/lib/utils";

const tabId = (i: number) => `news-tab-${i}`;

const NewsTabs = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = NEWS_INDUSTRIES[activeIndex] ?? NEWS_INDUSTRIES[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Industry"
        onKeyDown={onTablistKeyDown}
        className="mb-6 flex flex-wrap gap-2"
      >
        {NEWS_INDUSTRIES.map((industry, i) => {
          const selected = activeIndex === i;
          return (
            <button
              key={industry.label}
              id={tabId(i)}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="news-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "min-h-11 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium focus-ring transition-colors",
                selected
                  ? "bg-yellow-500 text-gray-900"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700",
              )}
            >
              {industry.label}
            </button>
          );
        })}
      </div>

      <div id="news-panel" role="tabpanel" aria-labelledby={tabId(activeIndex)}>
        <TradingViewWidget
          key={active.label} // force re-mount on tab change
          title={`${active.label} news`}
          scriptUrl={`${scriptUrl}timeline.js`}
          config={getNewsWidgetConfig(active.symbol ?? undefined)}
          height={600}
        />
      </div>
    </div>
  );
};

export default NewsTabs;
