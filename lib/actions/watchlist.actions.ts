"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function toggleWatchlist(
  symbol: string,
  company: string,
): Promise<{ added: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthenticated");

  await connectToDatabase();

  const existing = await Watchlist.findOne({ userId, symbol });
  if (existing) {
    await Watchlist.deleteOne({ userId, symbol });
    revalidatePath("/");
    revalidatePath("/watchlist");
    return { added: false };
  }

  await Watchlist.create({ userId, symbol, company });
  revalidatePath("/");
  revalidatePath("/watchlist");
  return { added: true };
}

export async function isSymbolInWatchlist(symbol: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  await connectToDatabase();
  const exists = await Watchlist.exists({ userId, symbol });
  return !!exists;
}

export async function getWatchlist(): Promise<
  { symbol: string; company: string; addedAt: Date }[]
> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  await connectToDatabase();
  const items = await Watchlist.find({ userId }).lean();
  return items.map((i) => ({
    symbol: String(i.symbol),
    company: String(i.company),
    addedAt: i.addedAt,
  }));
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

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error("getWatchlistSymbolsByEmail error:", err);
    return [];
  }
}
