"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { getSessionUser } from "@/lib/auth/session";
import { isDuplicateKeyError } from "@/lib/db/errors";
import type { ToggleWatchlistResult } from "@/types/watchlist";

// Every export of a "use server" file is a public POST endpoint: keep this file
// to authenticated, validated actions. Reads live in `lib/data/watchlist.ts`.

const toggleWatchlistInput = z.object({
  symbol: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9.\-]{1,12}$/),
  company: z.string().trim().min(1).max(120),
});

/**
 * Called from a Server Action, `revalidatePath` refreshes the current route in
 * the same round trip (here `/stocks/[symbol]`) and drops the client router
 * cache, so the dashboard and `/watchlist` re-render on the next navigation.
 */
const revalidateWatchlistPaths = (symbol: string) => {
  revalidatePath("/");
  revalidatePath("/watchlist");
  revalidatePath(`/stocks/${symbol}`);
};

/**
 * Adds the symbol if absent, removes it otherwise. Atomic per call: a
 * concurrent duplicate insert (double click, two tabs) is treated as "added"
 * instead of surfacing E11000. Never throws to the client.
 */
export async function toggleWatchlist(
  symbol: string,
  company: string,
): Promise<ToggleWatchlistResult> {
  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, reason: "unauthenticated" };

    const parsed = toggleWatchlistInput.safeParse({ symbol, company });
    if (!parsed.success) return { ok: false, reason: "invalid" };
    const input = parsed.data;

    await connectToDatabase();

    const removed = await Watchlist.findOneAndDelete({ userId: user.id, symbol: input.symbol });
    if (removed) {
      revalidateWatchlistPaths(input.symbol);
      return { ok: true, added: false };
    }

    try {
      await Watchlist.create({ userId: user.id, symbol: input.symbol, company: input.company });
    } catch (e) {
      // Another request inserted it between our delete and create: the
      // desired end state ("in the watchlist") is already reached.
      if (!isDuplicateKeyError(e)) throw e;
    }

    revalidateWatchlistPaths(input.symbol);
    return { ok: true, added: true };
  } catch (e) {
    console.error("toggleWatchlist error:", e);
    return { ok: false, reason: "error" };
  }
}
