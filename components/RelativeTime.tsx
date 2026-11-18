"use client";

import { useNow } from "@/hooks/useNow";
import { formatFullDate, formatRelativeDate } from "@/lib/time";

type RelativeTimeProps = {
  /** Unix timestamp in seconds, as Finnhub sends it. */
  time: number;
  className?: string;
};

/**
 * "3h ago" or "Nov 14", computed in the browser and refreshed every minute.
 * The server render only outputs the ISO `dateTime` attribute, so the server's
 * time zone never leaks into the text and hydration can't mismatch.
 */
export default function RelativeTime({ time, className }: RelativeTimeProps) {
  const now = useNow();
  const date = new Date(time * 1000);

  return (
    <time
      dateTime={date.toISOString()}
      title={now === null ? undefined : formatFullDate(date)}
      className={className}
    >
      {now === null ? null : formatRelativeDate(date, new Date(now))}
    </time>
  );
}
