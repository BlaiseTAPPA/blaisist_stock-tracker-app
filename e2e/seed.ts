import { MongoClient, ObjectId } from "mongodb";
import { hashPassword } from "better-auth/crypto";

// Creates the end-to-end test user directly in the test database, already
// verified: the tests never go through the verification email, and email
// verification stays required in the app itself.

export const E2E_USER = {
  name: "E2E Tester",
  email: "e2e@fingenius.test",
  password: "e2e-password-123",
} as const;

/**
 * Refuses anything but a local database whose name contains "e2e": the seed
 * drops the whole database first, so it must never run against a real one.
 */
export function assertTestDatabase(uri: string): void {
  const { hostname, pathname } = new URL(uri);
  const dbName = pathname.replace(/^\//, "");
  const isLocal = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname);
  if (!isLocal || !dbName.includes("e2e")) {
    throw new Error(
      `Refusing to seed "${hostname}/${dbName}": the e2e database must be local and its name must contain "e2e".`,
    );
  }
}

export async function seedDatabase(uri: string): Promise<void> {
  assertTestDatabase(uri);

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    await db.dropDatabase(); // fresh state: no watchlist, no rate-limit entries

    const now = new Date();
    const userId = new ObjectId();

    // Same shape as Better Auth's MongoDB adapter: `user` and `account`
    // collections, `userId` stored as an ObjectId, the password hash on the
    // credential account.
    await db.collection("user").insertOne({
      _id: userId,
      name: E2E_USER.name,
      email: E2E_USER.email,
      emailVerified: true,
      image: null,
      country: "US",
      investmentGoals: "Growth",
      riskTolerance: "Medium",
      preferredIndustry: "Technology",
      createdAt: now,
      updatedAt: now,
    });
    await db.collection("account").insertOne({
      _id: new ObjectId(),
      accountId: userId.toHexString(),
      providerId: "credential",
      userId,
      password: await hashPassword(E2E_USER.password),
      createdAt: now,
      updatedAt: now,
    });
  } finally {
    await client.close();
  }
}
