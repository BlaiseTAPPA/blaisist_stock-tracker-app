"use server";

import type { StockSearchResult } from "@/types/stock";
import { requireUser, UnauthenticatedError } from "@/lib/auth/session";
import { searchStocks } from "@/lib/finnhub/client";
import { searchQuerySchema } from "@/lib/validation/search";
import { createThrottle } from "@/lib/security/throttle";

// Every export of a "use server" file is a public POST endpoint: keep this file
// to authenticated, validated actions. Finnhub access lives in
// `lib/finnhub/client.ts` (server-only).

// 20 searches / 10 s per user (per server instance, see `createThrottle`).
const isThrottled = createThrottle({ windowMs: 10_000, max: 20 });

export async function searchStocksAction(query: string): Promise<StockSearchResult[]> {
  let userId: string;
  try {
    ({ id: userId } = await requireUser());
  } catch (e) {
    if (e instanceof UnauthenticatedError) return [];
    throw e;
  }

  const parsed = searchQuerySchema.safeParse(query);
  if (!parsed.success) return [];

  if (isThrottled(userId)) return [];

  return searchStocks(parsed.data);
}
