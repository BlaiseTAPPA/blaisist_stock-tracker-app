"use client";

import React, { memo, type CSSProperties } from "react";
import useTradingViewWidget, { type WidgetHeight } from "@/hooks/useTradingViewWidget";
import { cn } from "@/lib/utils";

interface TradingViewWidgetProps {
  /**
   * Accessible name of the widget's iframe, e.g. "Apple Inc. candlestick
   * chart". Required: screen readers otherwise announce an unnamed "frame".
   */
  title: string;
  scriptUrl: string;
  config: Record<string, unknown>;
  /** Pixels, or `{ base, md }` to use a different height from 768 px up. */
  height?: WidgetHeight;
  /** Defer the embed until the widget nears the viewport (default `true`). */
  lazy?: boolean;
  className?: string;
}

const TradingViewWidget = ({
  title,
  scriptUrl,
  config,
  height = 600,
  lazy = true,
  className,
}: TradingViewWidgetProps) => {
  const { containerRef, loaded, base, md } = useTradingViewWidget(scriptUrl, config, {
    title,
    height,
    lazy,
  });

  // The height is reserved in CSS (not JS) so the server-rendered HTML already
  // has the right size at every breakpoint: no layout shift when the widget loads.
  const sizeVars = { "--tv-h": `${base}px`, "--tv-h-md": `${md}px` } as CSSProperties;

  return (
    <div className="w-full">
      <div className="relative h-(--tv-h) md:h-(--tv-h-md)" style={sizeVars}>
        {/* Left empty on purpose: the hook owns this node's children. */}
        <div ref={containerRef} className={cn("tradingview-widget-container h-full", className)} />
        {!loaded && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-lg bg-surface-raised motion-safe:animate-pulse"
          />
        )}
      </div>
    </div>
  );
};

export default memo(TradingViewWidget);
