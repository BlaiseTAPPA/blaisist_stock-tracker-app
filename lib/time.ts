// Date helpers for the viewer's browser: every formatter uses the browser's
// time zone and language (`undefined` locale), never the server's.

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * "3:42 PM" when `date` is today, "Nov 14, 4:00 PM" otherwise (a weekend shows
 * Friday's close), with the year when it differs from the current one.
 */
export function formatAsOf(date: Date, now: Date): string {
  if (sameDay(date, now)) {
    return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
  });
}

// Words in English like the rest of the UI ("3h ago"); dates follow the browser.
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "narrow" });

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
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });
}

/** Full date and time, for the `title` tooltip of a relative date. */
export const formatFullDate = (date: Date) =>
  date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
