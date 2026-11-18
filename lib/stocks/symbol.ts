// Tickers as Finnhub and TradingView spell them: letters, digits, "." (BRK.B)
// and "-" (RDS-A). Anything else in the URL is not a symbol.
const SYMBOL_PATTERN = /^[A-Z0-9.\-]{1,12}$/;

/**
 * Normalizes the raw `[symbol]` route param: URL-decoded, uppercased and
 * validated. Returns `null` for a malformed param (e.g. `%3Cscript%3E` or a
 * broken escape such as `%E0`).
 */
export function normalizeSymbol(raw: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return null; // URIError: malformed percent-encoding
  }
  const sym = decoded.trim().toUpperCase();
  return SYMBOL_PATTERN.test(sym) ? sym : null;
}
