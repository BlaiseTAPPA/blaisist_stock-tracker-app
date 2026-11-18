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
  // Undo of a removal: the original date, so the stock gets its place back
  // in "Recently added". Never in the future.
  addedAt: z.iso
    .datetime()
    .transform((value) => new Date(value))
    .refine((date) => date.getTime() <= Date.now())
    .optional(),
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
 *
 * With `options.addedAt` (the "Undo" of a removal toast), it only adds: the
 * stock is restored with that date, and is left alone if it is already back.
 */
export async function toggleWatchlist(
  symbol: string,
  company: string,
  options?: { addedAt?: string },
): Promise<ToggleWatchlistResult> {
  try {
    const user = await getSessionUser();
    if (!user) return { ok: false, reason: "unauthenticated" };

    const parsed = toggleWatchlistInput.safeParse({ symbol, company, addedAt: options?.addedAt });
    if (!parsed.success) return { ok: false, reason: "invalid" };
    const input = parsed.data;

    await connectToDatabase();

    if (!input.addedAt) {
      const removed = await Watchlist.findOneAndDelete({ userId: user.id, symbol: input.symbol });
      if (removed) {
        revalidateWatchlistPaths(input.symbol);
        return { ok: true, added: false, addedAt: removed.addedAt.toISOString() };
      }
    }

    try {
      await Watchlist.create({
        userId: user.id,
        symbol: input.symbol,
        company: input.company,
        ...(input.addedAt && { addedAt: input.addedAt }),
      });
    } catch (e) {
      // Another request inserted it between our delete and create (or the
      // undo ran twice): the desired end state, "in the watchlist", is reached.
      if (!isDuplicateKeyError(e)) throw e;
    }

    revalidateWatchlistPaths(input.symbol);
    return { ok: true, added: true };
  } catch (e) {
    console.error("toggleWatchlist error:", e);
    return { ok: false, reason: "error" };
  }
}
