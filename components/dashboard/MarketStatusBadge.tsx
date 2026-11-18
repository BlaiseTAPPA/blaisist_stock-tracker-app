import { getMarketStatus } from "@/lib/finnhub/client";
import { cn } from "@/lib/utils";

// Extended-hours sessions are reported as such, whatever `isOpen` says.
const SESSION_LABELS: Record<string, string> = {
  "pre-market": "US pre-market",
  "post-market": "US after hours",
};

/**
 * "US market open / closed" badge from `/stock/market-status` (one call per
 * minute, cached). Renders nothing when Finnhub doesn't answer.
 */
export default async function MarketStatusBadge({ className }: { className?: string }) {
  const status = await getMarketStatus();
  if (!status) return null;

  const sessionLabel = status.session ? SESSION_LABELS[status.session] : undefined;
  const open = status.isOpen && !sessionLabel;
  const label =
    sessionLabel ??
    (open
      ? "US market open"
      : status.holiday
        ? `US market closed (${status.holiday})`
        : "US market closed");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        open ? "border-gain/40 text-gain" : "border-gray-600 text-gray-400",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full", open ? "bg-gain" : "bg-gray-500")}
      />
      {label}
    </span>
  );
}
