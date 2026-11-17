// Finnhub error types. Messages only carry the endpoint path (e.g. "/quote"),
// never the request URL: the URL holds the API token in its query string.

export class FinnhubError extends Error {
  /** HTTP status, or `null` for a timeout / network failure. */
  readonly status: number | null;
  readonly endpoint: string;

  constructor(endpoint: string, status: number | null, reason?: string) {
    super(
      `Finnhub ${endpoint} failed: ${reason ?? (status === null ? "network error" : `HTTP ${status}`)}`,
    );
    this.name = "FinnhubError";
    this.endpoint = endpoint;
    this.status = status;
  }
}

export class FinnhubRateLimitError extends FinnhubError {
  /** Seconds from the `Retry-After` header, when Finnhub sends one. */
  readonly retryAfterSeconds: number | null;

  constructor(endpoint: string, retryAfterSeconds: number | null) {
    super(endpoint, 429, "rate limited (HTTP 429)");
    this.name = "FinnhubRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
