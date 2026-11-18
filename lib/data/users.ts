import "server-only";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";

export type NewsDigestRecipient = {
  id: string;
  email: string;
  name: string;
  symbols: string[];
};

/**
 * Most recently added symbols kept per recipient. Each symbol costs one
 * Finnhub call per digest, and the digest only shows 6 articles anyway.
 */
export const MAX_DIGEST_SYMBOLS = 3;

/**
 * Verified users who did not turn the digest off, with their latest watchlist symbols, in a single query
 * (no per-user lookup). It starts from the `user` collection, which Better
 * Auth owns, so users with an empty watchlist are kept: they get general news.
 * The join uses the `userId` index of the watchlist collection.
 */
export const getNewsDigestRecipients = async (): Promise<NewsDigestRecipient[]> => {
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error("Mongoose connection not connected");

  return db
    .collection("user")
    .aggregate<NewsDigestRecipient>([
      {
        $match: {
          emailVerified: true,
          // Opted out in /settings or through an unsubscribe link. A missing
          // field means "on": accounts created before the switch existed
          // keep their digest without a migration.
          digestEnabled: { $ne: false },
          email: { $type: "string", $ne: "" },
          name: { $type: "string", $ne: "" },
        },
      },
      // Watchlist.userId holds the session user id, i.e. the stringified _id.
      { $addFields: { uid: { $ifNull: ["$id", { $toString: "$_id" }] } } },
      {
        $lookup: {
          from: Watchlist.collection.collectionName,
          localField: "uid",
          foreignField: "userId",
          pipeline: [
            { $sort: { addedAt: -1 } },
            { $limit: MAX_DIGEST_SYMBOLS },
            { $project: { _id: 0, symbol: 1 } },
          ],
          as: "watchlist",
        },
      },
      { $project: { _id: 0, id: "$uid", email: 1, name: 1, symbols: "$watchlist.symbol" } },
    ])
    .toArray();
};
