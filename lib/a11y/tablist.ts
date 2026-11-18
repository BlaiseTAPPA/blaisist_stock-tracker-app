import type { KeyboardEvent } from "react";

/**
 * Arrow-key navigation for a `role="tablist"` (WAI-ARIA tabs pattern, manual
 * activation): Left/Right wrap around, Home/End jump to the ends. Keys only
 * move focus; Enter or Space then selects the tab (native button click), so
 * browsing the tabs doesn't reload a TradingView widget at every key press.
 * Put it on the tablist element; the selected tab has `tabIndex={0}`, the
 * others `-1`, so Tab enters and leaves the list in one stop.
 */
export function onTablistKeyDown(event: KeyboardEvent<HTMLElement>) {
  const tabs = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not([disabled])'),
  );
  const current = tabs.indexOf(document.activeElement as HTMLElement);
  if (current === -1 || tabs.length === 0) return;

  let next: number;
  switch (event.key) {
    case "ArrowRight":
      next = (current + 1) % tabs.length;
      break;
    case "ArrowLeft":
      next = (current - 1 + tabs.length) % tabs.length;
      break;
    case "Home":
      next = 0;
      break;
    case "End":
      next = tabs.length - 1;
      break;
    default:
      return;
  }

  event.preventDefault();
  tabs[next]?.focus();
}
