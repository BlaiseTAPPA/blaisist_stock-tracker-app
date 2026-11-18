"use client";

import { useState } from "react";
import TradingViewWidget from "@/components/TradingViewWidget";
import {
  NEWS_INDUSTRIES,
  getNewsWidgetConfig,
  TRADINGVIEW_SCRIPT_BASE_URL as scriptUrl,
} from "@/lib/constants";

const NewsTabs = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = NEWS_INDUSTRIES[activeIndex] ?? NEWS_INDUSTRIES[0];

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {NEWS_INDUSTRIES.map((industry, i) => (
          <button
            key={industry.label}
            onClick={() => setActiveIndex(i)}
            className={`min-h-11 rounded-full px-4 py-1.5 text-sm font-medium transition-colors sm:min-h-0 ${
              activeIndex === i
                ? "bg-yellow-500 text-black"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
            }`}
          >
            {industry.label}
          </button>
        ))}
      </div>

      {/* Widget */}
      <TradingViewWidget
        key={active.label} // force re-mount on tab change
        scriptUrl={`${scriptUrl}timeline.js`}
        config={getNewsWidgetConfig(active.symbol ?? undefined)}
        height={600}
      />
    </div>
  );
};

export default NewsTabs;
