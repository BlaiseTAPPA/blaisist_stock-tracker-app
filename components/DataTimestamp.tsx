"use client";

import { useNow } from "@/hooks/useNow";
import { formatAsOf, formatFullDate } from "@/lib/time";
import { cn } from "@/lib/utils";

type DataTimestampProps = {
  /** Unix timestamp in seconds, as Finnhub sends it (`quote.t`). */
  time?: number;
  className?: string;
};

/**
 * "As of 3:42 PM" in the viewer's time zone and language. The server render
 * and the hydration pass only output the ISO `dateTime` attribute (the text
 * depends on the browser's clock and zone), then the text fills in.
 * Renders nothing without a timestamp.
 */
export default function DataTimestamp({ time, className }: DataTimestampProps) {
  const now = useNow();
  if (!time) return null;

  const date = new Date(time * 1000);
  return (
    <time
      dateTime={date.toISOString()}
      title={now === null ? undefined : formatFullDate(date)}
      className={cn("text-xs text-gray-500 tabular-nums", className)}
    >
      {now === null ? null : `As of ${formatAsOf(date, new Date(now))}`}
    </time>
  );
}
