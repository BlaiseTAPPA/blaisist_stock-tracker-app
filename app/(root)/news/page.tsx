'use client'

import { useState } from "react";
import TradingViewWidget from "@/components/TradingViewWidget";
import { NEWS_INDUSTRIES, getNewsWidgetConfig } from "@/lib/constants";

const scriptUrl = "https://s3.tradingview.com/external-embedding/embed-widget-";

const NewsPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = NEWS_INDUSTRIES[activeIndex];

  return (
    <main className="p-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {NEWS_INDUSTRIES.map((industry, i) => (
          <button
            key={industry.label}
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${activeIndex === i
                ? 'bg-yellow-500 text-black'
                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
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
    </main>
  );
};

export default NewsPage;