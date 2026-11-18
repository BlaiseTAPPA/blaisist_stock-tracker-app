// Watchlist types shared by the server action and the client components.
// Stock, search and quote-row types live in `types/stock.ts`.

/** `addedAt` (ISO date) of a removed stock, for the "Undo" of the removal toast. */
export type ToggleWatchlistResult =
  | { ok: true; added: true }
  | { ok: true; added: false; addedAt: string }
  | { ok: false; reason: "unauthenticated" | "invalid" | "error" };
