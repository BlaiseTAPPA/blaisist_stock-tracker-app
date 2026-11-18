import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { formatAsOf, formatFullDate, formatRelativeDate } from "@/lib/time";

// The helpers use the process time zone, like a browser uses its own. Node
// re-reads `TZ` when it is assigned, so each test can pick the viewer's zone.
const originalTz = process.env.TZ;
const setTz = (tz: string) => {
  process.env.TZ = tz;
};
afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

// Recent ICU versions put a narrow no-break space before AM/PM.
const plain = (s: string) => s.replace(/\s/g, " ");

// Friday Nov 14, 2025, 15:00 UTC (16:00 in Paris, 10:00 in New York).
const close = new Date(Date.UTC(2025, 10, 14, 15, 0));

describe("formatAsOf", () => {
  beforeEach(() => setTz("Europe/Paris"));

  it("formats an earlier day in US English with the browser's zone, whatever its language", () => {
    const monday = new Date(Date.UTC(2025, 10, 17, 9, 0));
    expect(plain(formatAsOf(close, monday))).toBe("Nov 14, 4:00 PM GMT+1");
  });

  it("shows only the time when the date is today", () => {
    const later = new Date(Date.UTC(2025, 10, 14, 18, 0));
    expect(plain(formatAsOf(close, later))).toBe("4:00 PM GMT+1");
  });

  it("adds the year when it isn't the current one", () => {
    const nextYear = new Date(Date.UTC(2026, 0, 5, 9, 0));
    expect(plain(formatAsOf(close, nextYear))).toBe("Nov 14, 2025, 4:00 PM GMT+1");
  });

  it("uses the viewer's zone for the time and its abbreviation", () => {
    setTz("America/New_York");
    const later = new Date(Date.UTC(2025, 10, 14, 20, 0));
    expect(plain(formatAsOf(close, later))).toBe("10:00 AM EST");
  });

  it("decides 'today' in the viewer's zone, not in UTC", () => {
    // 23:30 UTC on Nov 14 is already Nov 15 in Tokyo.
    setTz("Asia/Tokyo");
    const late = new Date(Date.UTC(2025, 10, 14, 23, 30));
    const now = new Date(Date.UTC(2025, 10, 15, 1, 0));
    expect(plain(formatAsOf(late, now))).toBe("8:30 AM GMT+9");
  });
});

describe("formatRelativeDate", () => {
  beforeEach(() => setTz("Europe/Paris"));
  const at = (ms: number) => new Date(close.getTime() + ms);

  it("reads 'just now' under a minute, and for a date slightly in the future", () => {
    expect(formatRelativeDate(close, at(30_000))).toBe("just now");
    expect(formatRelativeDate(close, at(-90_000))).toBe("just now");
  });

  it("counts minutes, then hours, in English", () => {
    expect(plain(formatRelativeDate(close, at(12 * 60_000)))).toBe("12m ago");
    expect(plain(formatRelativeDate(close, at(3 * 3_600_000)))).toBe("3h ago");
  });

  it("falls back to the date after 24 hours, with the year when it differs", () => {
    expect(formatRelativeDate(close, at(2 * 86_400_000))).toBe("Nov 14");
    expect(formatRelativeDate(close, new Date(Date.UTC(2026, 1, 1)))).toBe("Nov 14, 2025");
  });
});

describe("formatFullDate", () => {
  it("gives the full date, time and zone in US English", () => {
    setTz("Europe/Paris");
    expect(plain(formatFullDate(close))).toBe("Nov 14, 2025, 4:00 PM GMT+1");
  });
});
