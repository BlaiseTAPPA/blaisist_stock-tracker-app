// One-off migration for the switch to required email verification (SEC-04).
//
// Accounts created before verification was required have
// `emailVerified: false` and would be locked out. This script marks every
// existing unverified user as verified.
//
// Usage (run ONCE, right after deploying the change, before new sign-ups
// arrive: a user who signs up after the deploy but before the script runs
// would be marked verified without clicking the link):
//   node scripts/mark-existing-users-verified.mjs           # dry run (default)
//   node scripts/mark-existing-users-verified.mjs --apply   # writes
//
// Reads MONGODB_URI from .env.local, then .env, or from the shell.

import { config } from "dotenv";
import { MongoClient } from "mongodb";

config({ path: [".env.local", ".env"], quiet: true });

const apply = process.argv.includes("--apply");
const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Error: MONGODB_URI must be set (in .env.local, .env or the shell).");
  process.exit(1);
}

const filter = { emailVerified: { $ne: true } };
const client = new MongoClient(uri);

try {
  await client.connect();
  const users = client.db().collection("user");

  const total = await users.countDocuments();
  const toUpdate = await users.countDocuments(filter);
  console.log(`Database: ${client.db().databaseName}`);
  console.log(`Users: ${total} in total, ${toUpdate} not verified.`);

  if (!apply) {
    console.log("Dry run: nothing was written. Re-run with --apply to mark them as verified.");
  } else {
    const result = await users.updateMany(filter, {
      $set: { emailVerified: true, updatedAt: new Date() },
    });
    console.log(`Done: ${result.modifiedCount} user(s) marked as verified.`);
  }
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.close();
}
