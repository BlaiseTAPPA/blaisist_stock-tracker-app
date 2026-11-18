import { MongoClient, ObjectId, type Db } from "mongodb";
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
 * Second user for the account tests (password reset, settings, unsubscribe):
 * its password changes during the run, so the smoke test keeps its own user.
 * No preferences, like an account created with the short sign-up form.
 */
export const E2E_ACCOUNT_USER = {
  name: "Account Tester",
  email: "account@fingenius.test",
  password: "account-password-123",
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

// Same shape as Better Auth's MongoDB adapter: `user` and `account`
// collections, `userId` stored as an ObjectId, the password hash on the
// credential account.
async function insertUser(
  db: Db,
  user: { name: string; email: string; password: string },
  profile: Record<string, string> = {},
): Promise<void> {
  const now = new Date();
  const userId = new ObjectId();

  await db.collection("user").insertOne({
    _id: userId,
    name: user.name,
    email: user.email,
    emailVerified: true,
    image: null,
    ...profile,
    createdAt: now,
    updatedAt: now,
  });
  await db.collection("account").insertOne({
    _id: new ObjectId(),
    accountId: userId.toHexString(),
    providerId: "credential",
    userId,
    password: await hashPassword(user.password),
    createdAt: now,
    updatedAt: now,
  });
}

export async function seedDatabase(uri: string): Promise<void> {
  assertTestDatabase(uri);

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    await db.dropDatabase(); // fresh state: no watchlist, no rate-limit entries

    await insertUser(db, E2E_USER, {
      country: "US",
      investmentGoals: "Growth",
      riskTolerance: "Medium",
      preferredIndustry: "Technology",
    });
    await insertUser(db, E2E_ACCOUNT_USER);
  } finally {
    await client.close();
  }
}
