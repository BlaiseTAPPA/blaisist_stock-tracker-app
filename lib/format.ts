// Pure display formatters for financial values. Every function returns
// PLACEHOLDER ("—") for `undefined`, `null`, `NaN` or a non-finite number, so
// callers never have to guard a missing quote themselves.

export const PLACEHOLDER = "—";

/** True minus sign (U+2212): aligns with "+" and isn't read as a hyphen. */
const MINUS = "−";

type Numeric = number | null | undefined;

const isFiniteNumber = (value: Numeric): value is number =>
  typeof value === "number" && Number.isFinite(value);

// Intl.NumberFormat construction is costly: reuse one instance per option set.
const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatters.set(key, formatter);
  }
  return formatter;
}

// Finnhub sends ISO 4217 codes, but an empty or malformed one makes
// Intl.NumberFormat throw a RangeError: fall back to USD then.
function currencyFormatter(
  locale: string,
  currency: string,
  options: Intl.NumberFormatOptions,
): Intl.NumberFormat {
  try {
    return getFormatter(locale, { ...options, style: "currency", currency });
  } catch {
    return getFormatter(locale, { ...options, style: "currency", currency: "USD" });
  }
}

/** `formatPrice(1234.5)` → `"$1,234.50"`; `formatPrice(98.1, "EUR")` → `"€98.10"`. */
export function formatPrice(value: Numeric, currency = "USD", locale = "en-US"): string {
  if (!isFiniteNumber(value)) return PLACEHOLDER;
  return currencyFormatter(locale, currency, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Signed percent change with two decimals: `"+1.23%"`, `"−0.45%"`, `"0.00%"`.
 * A value that rounds to zero gets no sign.
 */
export function formatPercent(value: Numeric): string {
  if (!isFiniteNumber(value)) return PLACEHOLDER;
  const digits = getFormatter("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  const roundsToZero = Math.round(Math.abs(value) * 100) === 0;
  const sign = roundsToZero ? "" : value > 0 ? "+" : MINUS;
  return `${sign}${digits}%`;
}

/**
 * Market capitalization in compact notation: `formatMarketCap(3_100_000)` → `"$3.1T"`.
 *
 * Takes the value **in millions** of `currency`, as Finnhub sends it
 * (`marketCapitalization` in `/stock/metric` and `/stock/profile2`).
 * A non-positive value means Finnhub has no figure and returns the placeholder.
 */
export function formatMarketCap(millions: Numeric, currency = "USD", locale = "en-US"): string {
  if (!isFiniteNumber(millions) || millions <= 0) return PLACEHOLDER;
  return currencyFormatter(locale, currency, {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(millions * 1_000_000);
}

/** Ratio such as a P/E, with one decimal: `formatRatio(28.437)` → `"28.4"`. */
export function formatRatio(value: Numeric, locale = "en-US"): string {
  if (!isFiniteNumber(value)) return PLACEHOLDER;
  const formatted = getFormatter(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value));
  return value < 0 && formatted !== "0.0" ? `${MINUS}${formatted}` : formatted;
}
