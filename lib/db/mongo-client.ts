import "server-only";

import { MongoClient } from "mongodb";

declare global {
  var mongoClient: MongoClient | undefined;
}

const createClient = () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI must be set within .env");
  // The constructor does not open a connection: the driver connects on the
  // first operation (or on an explicit `connect()`), so importing this module
  // never touches the network. That keeps `next build` database-free.
  return new MongoClient(uri);
};

/**
 * The single MongoClient (and connection pool) of the app. Better Auth uses it
 * directly, and Mongoose is attached to it in `database/mongoose.ts`.
 * Cached on `globalThis` so dev hot reloads do not open a new pool each time.
 */
export const mongoClient = globalThis.mongoClient ?? createClient();

if (process.env.NODE_ENV !== "production") globalThis.mongoClient = mongoClient;
