import "server-only";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";

// Data-access layer for watchlists. Callers are responsible for passing an
// authorized user id (the session's own id, or a trusted Inngest job).

export async function getWatchlistForUser(
  userId: string,
): Promise<{ symbol: string; company: string; addedAt: Date }[]> {
  if (!userId) return [];

  await connectToDatabase();
  // Newest first; the compound index starts with `userId`, so this sorts the
  // (small) per-user result in memory.
  const items = await Watchlist.find({ userId }, { _id: 0, symbol: 1, company: 1, addedAt: 1 })
    .sort({ addedAt: -1 })
    .lean();
  return items.map((i) => ({
    symbol: String(i.symbol),
    company: String(i.company),
    addedAt: i.addedAt,
  }));
}

export async function isSymbolInWatchlist(userId: string, symbol: string): Promise<boolean> {
  if (!userId) return false;

  await connectToDatabase();
  const exists = await Watchlist.exists({ userId, symbol });
  return !!exists;
}

export async function getWatchlistSymbolsByUserId(userId: string): Promise<string[]> {
  if (!userId) return [];

  try {
    await connectToDatabase();
    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error("getWatchlistSymbolsByUserId error:", err);
    return [];
  }
}
