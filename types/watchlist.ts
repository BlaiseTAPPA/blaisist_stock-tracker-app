// Watchlist types shared by the server action and the client components.
// Stock and search types live in `types/stock.ts`.

export type ToggleWatchlistResult =
  | { ok: true; added: boolean }
  | { ok: false; reason: "unauthenticated" | "invalid" | "error" };

/** One card of the dashboard watchlist grid. */
export type StockWithData = {
  symbol: string;
  company: string;
  priceFormatted?: string;
  changeFormatted?: string;
  changePercent?: number;
};
