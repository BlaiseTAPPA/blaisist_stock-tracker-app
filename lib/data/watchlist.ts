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
  const items = await Watchlist.find({ userId }).lean();
  return items.map((i) => ({
    symbol: String(i.symbol),
    company: String(i.company),
    addedAt: i.addedAt,
  }));
}

export async function isSymbolInWatchlist(
  userId: string,
  symbol: string,
): Promise<boolean> {
  if (!userId) return false;

  await connectToDatabase();
  const exists = await Watchlist.exists({ userId, symbol });
  return !!exists;
}

export async function getWatchlistSymbolsByUserId(
  userId: string,
): Promise<string[]> {
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

export async function getWatchlistSymbolsByEmail(
  email: string,
): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    // Better Auth stores users in the "user" collection
    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) return [];

    return getWatchlistSymbolsByUserId(userId);
  } catch (err) {
    console.error("getWatchlistSymbolsByEmail error:", err);
    return [];
  }
}
