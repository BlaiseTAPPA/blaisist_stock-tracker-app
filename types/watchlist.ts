// Watchlist types shared by the server action and the client components.
// Stock, search and quote-row types live in `types/stock.ts`.

export type ToggleWatchlistResult =
  { ok: true; added: boolean } | { ok: false; reason: "unauthenticated" | "invalid" | "error" };
