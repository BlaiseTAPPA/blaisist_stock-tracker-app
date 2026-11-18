// Date helpers for the viewer's browser. Words and formats are US English
// ("en-US"), like the rest of the UI and the numbers (`lib/format.ts`); the
// time zone is the browser's (no `timeZone` option: the default is the right
// one). They run client-side only, through `useNow`, so the server's zone
// never reaches the text and hydration can't mismatch.

const LOCALE = "en-US";

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * "3:42 PM EST" when `date` is today, "Nov 14, 4:00 PM GMT+1" otherwise (a
 * weekend shows Friday's close), with the year when it differs from the
 * current one. The zone name says which clock the time is on.
 */
export function formatAsOf(date: Date, now: Date): string {
  if (sameDay(date, now)) {
    return date.toLocaleTimeString(LOCALE, {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  }
  return date.toLocaleString(LOCALE, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

const relative = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto", style: "narrow" });

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * "just now", "12m ago", "3h ago" within the last 24 hours, then the date:
 * "Nov 14" (with the year when it isn't the current one).
 */
export function formatRelativeDate(date: Date, now: Date): string {
  const elapsed = now.getTime() - date.getTime();
  // A clock slightly ahead of the publisher's must not read "in 2 min".
  if (elapsed < MINUTE) return "just now";
  if (elapsed < HOUR) return relative.format(-Math.floor(elapsed / MINUTE), "minute");
  if (elapsed < DAY) return relative.format(-Math.floor(elapsed / HOUR), "hour");
  return date.toLocaleDateString(LOCALE, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });
}

/** "Nov 14, 2025, 4:00 PM GMT+1", for the `title` tooltip of a date. */
export const formatFullDate = (date: Date) =>
  date.toLocaleString(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
