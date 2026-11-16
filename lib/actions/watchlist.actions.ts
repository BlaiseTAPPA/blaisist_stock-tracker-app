"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { requireUser } from "@/lib/auth/session";

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

export async function toggleWatchlist(
  symbol: string,
  company: string,
): Promise<{ added: boolean }> {
  const { id: userId } = await requireUser();

  const parsed = toggleWatchlistInput.safeParse({ symbol, company });
  if (!parsed.success) throw new Error("Invalid watchlist input");
  const input = parsed.data;

  await connectToDatabase();

  const existing = await Watchlist.findOne({ userId, symbol: input.symbol });
  if (existing) {
    await Watchlist.deleteOne({ userId, symbol: input.symbol });
    revalidatePath("/");
    revalidatePath("/watchlist");
    return { added: false };
  }

  await Watchlist.create({ userId, symbol: input.symbol, company: input.company });
  revalidatePath("/");
  revalidatePath("/watchlist");
  return { added: true };
}
