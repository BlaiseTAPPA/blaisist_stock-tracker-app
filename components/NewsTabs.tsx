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

// Tab 0 is the Finnhub feed of the dashboard panel ("View all" lands on it);
// the next tabs are TradingView timelines by industry.
const TABS = ["Top headlines", ...NEWS_INDUSTRIES.map((industry) => industry.label)];

/** `headlines`: the server-rendered "Top headlines" list (inside its own Suspense). */
const NewsTabs = ({ headlines }: { headlines: React.ReactNode }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const industry = activeIndex > 0 ? NEWS_INDUSTRIES[activeIndex - 1] : undefined;

  return (
    <div>
      <div
        role="tablist"
        aria-label="News feed"
        onKeyDown={onTablistKeyDown}
        className="mb-6 flex flex-wrap gap-2"
      >
        {TABS.map((label, i) => {
          const selected = activeIndex === i;
          return (
            <button
              key={label}
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
                  ? "bg-fg text-surface"
                  : "bg-surface-raised text-fg-secondary hover:bg-surface-hover",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div id="news-panel" role="tabpanel" aria-labelledby={tabId(activeIndex)}>
        {industry ? (
          <TradingViewWidget
            key={industry.label} // force re-mount on tab change
            title={`${industry.label} news`}
            scriptUrl={`${scriptUrl}timeline.js`}
            config={getNewsWidgetConfig(industry.symbol ?? undefined)}
            height={600}
          />
        ) : (
          headlines
        )}
      </div>
    </div>
  );
};

export default NewsTabs;
