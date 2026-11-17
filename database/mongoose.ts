import mongoose from "mongoose";
import { mongoClient } from "@/lib/db/mongo-client";

declare global {
  var mongooseCache: { promise: Promise<typeof mongoose> | null } | undefined;
}

const cached = (globalThis.mongooseCache ??= { promise: null });

// Fail fast instead of queueing model operations while disconnected
// (same behaviour as the previous `mongoose.connect(uri, { bufferCommands: false })`).
mongoose.set("bufferCommands", false);

/**
 * Attaches Mongoose to the app-wide MongoClient, so Mongoose models and
 * Better Auth share one connection pool instead of opening two.
 * `setClient()` requires a connected client, hence the explicit `connect()`.
 */
export const connectToDatabase = (): Promise<typeof mongoose> => {
  cached.promise ??= (async () => {
    await mongoClient.connect();
    if (mongoose.connection.readyState === mongoose.ConnectionStates.disconnected) {
      mongoose.connection.setClient(mongoClient);
    }
    console.log(`Connected to MongoDB: ${process.env.NODE_ENV ?? "unknown"}`);
    return mongoose;
  })().catch((error: unknown) => {
    cached.promise = null;
    console.error("MongoDB connection error:", error);
    throw error;
  });

  return cached.promise;
};
