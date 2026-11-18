import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { ObjectId, type Db } from "mongodb";
import type { getNewsDigestRecipients as GetNewsDigestRecipients } from "@/lib/data/users";

// The digest switch (FLOW-03): getNewsDigestRecipients must leave out users
// who turned the digest off, and keep those who never touched it.
// Throwaway in-memory MongoDB: never the user's.

let mongo: MongoMemoryServer;
let db: Db;
let getNewsDigestRecipients: typeof GetNewsDigestRecipients;

const user = (email: string, extra: Record<string, unknown> = {}) => ({
  _id: new ObjectId(),
  name: email.split("@")[0],
  email,
  emailVerified: true,
  ...extra,
});

beforeAll(async () => {
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } });
  process.env.MONGODB_URI = mongo.getUri("fingenius-digest-test");

  ({ getNewsDigestRecipients } = await import("@/lib/data/users"));
  const { connectToDatabase } = await import("@/database/mongoose");
  const mongoose = await connectToDatabase();
  db = mongoose.connection.db as Db;
});

afterAll(async () => {
  const mongoose = (await import("mongoose")).default;
  await mongoose.disconnect();
  await globalThis.mongoClient?.close();
  await mongo?.stop();
});

beforeEach(async () => {
  await db.collection("user").deleteMany({});
  await db.collection("watchlists").deleteMany({});
});

describe("getNewsDigestRecipients", () => {
  it("excludes users who turned the digest off", async () => {
    await db
      .collection("user")
      .insertMany([
        user("never-set@example.com"),
        user("on@example.com", { digestEnabled: true }),
        user("off@example.com", { digestEnabled: false }),
      ]);

    const emails = (await getNewsDigestRecipients()).map((r) => r.email).sort();
    expect(emails).toEqual(["never-set@example.com", "on@example.com"]);
  });

  it("still excludes unverified users", async () => {
    await db
      .collection("user")
      .insertMany([
        user("verified@example.com"),
        user("unverified@example.com", { emailVerified: false }),
      ]);

    const emails = (await getNewsDigestRecipients()).map((r) => r.email);
    expect(emails).toEqual(["verified@example.com"]);
  });

  it("includes a user again once the digest is back on", async () => {
    const off = user("back@example.com", { digestEnabled: false });
    await db.collection("user").insertOne(off);
    expect(await getNewsDigestRecipients()).toEqual([]);

    await db.collection("user").updateOne({ _id: off._id }, { $set: { digestEnabled: true } });
    const recipients = await getNewsDigestRecipients();
    expect(recipients).toEqual([
      { id: off._id.toHexString(), email: "back@example.com", name: "back", symbols: [] },
    ]);
  });
});
