"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type WidgetHeight = number | { base: number; md?: number };

export const MD_QUERY = "(min-width: 768px)";
const LOAD_TIMEOUT_MS = 15_000;

export const normalizeHeight = (height: WidgetHeight) =>
  typeof height === "number"
    ? { base: height, md: height }
    : { base: height.base, md: height.md ?? height.base };

interface Options {
  height?: WidgetHeight;
  /** Inject the script only when the container nears the viewport. */
  lazy?: boolean;
}

/**
 * Mounts a TradingView embed widget into a container that React renders
 * empty and never touches again: the hook owns that node's children (the
 * widget div and the script), so React never reconciles nodes it didn't create.
 */
const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  { height = 600, lazy = true }: Options = {},
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Configs are often built inline (`CONFIG(symbol)`), so their identity
  // changes on every render. Keying the effect on the serialised value means a
  // parent re-render no longer tears down and re-injects the widget.
  const configKey = useMemo(() => JSON.stringify(config), [config]);
  const { base, md } = normalizeHeight(height);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const widgetConfig = JSON.parse(configKey) as Record<string, unknown>;
    const mql = window.matchMedia(MD_QUERY);
    let injected = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let giveUp: ReturnType<typeof setTimeout> | undefined;
    let observer: IntersectionObserver | undefined;
    let iframeWatcher: MutationObserver | undefined;

    const inject = () => {
      const h = mql.matches ? md : base;
      node.replaceChildren();
      setLoaded(false);

      const widget = document.createElement("div");
      widget.className = "tradingview-widget-container__widget";
      widget.style.width = "100%";
      widget.style.height = `${h}px`;

      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      // Keep the widget's own height in sync with the reserved space.
      script.textContent = JSON.stringify(
        "height" in widgetConfig ? { ...widgetConfig, height: h } : widgetConfig,
      );

      // Stop the placeholder pulse when the iframe loads, or after a grace
      // period if the embed never renders (blocked or failing script).
      clearTimeout(giveUp);
      giveUp = setTimeout(() => setLoaded(true), LOAD_TIMEOUT_MS);
      iframeWatcher?.disconnect();
      iframeWatcher = new MutationObserver(() => {
        const iframe = node.querySelector("iframe");
        if (!iframe) return;
        iframeWatcher?.disconnect();
        iframe.addEventListener("load", () => setLoaded(true), { once: true });
      });
      iframeWatcher.observe(node, { childList: true, subtree: true });

      node.append(widget, script);
      injected = true;
    };

    // Inject on the next task rather than synchronously: StrictMode's
    // mount → unmount → mount cancels the first timer, so the script is
    // injected once instead of being added, removed and added again.
    const schedule = () => {
      timer = setTimeout(inject, 0);
    };

    if (lazy && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer?.disconnect();
            schedule();
          }
        },
        { rootMargin: "200px" },
      );
      observer.observe(node);
    } else {
      schedule();
    }

    // Crossing the md breakpoint changes the height: re-inject at the new size,
    // but only for a widget that is already on screen.
    const onBreakpoint = () => {
      if (injected && base !== md) inject();
    };
    mql.addEventListener("change", onBreakpoint);

    return () => {
      clearTimeout(timer);
      clearTimeout(giveUp);
      observer?.disconnect();
      iframeWatcher?.disconnect();
      mql.removeEventListener("change", onBreakpoint);
      node.replaceChildren();
    };
  }, [scriptUrl, configKey, base, md, lazy]);

  return { containerRef, loaded, base, md };
};

export default useTradingViewWidget;
