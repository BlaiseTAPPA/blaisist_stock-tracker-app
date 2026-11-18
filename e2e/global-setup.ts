import { MongoMemoryServer } from "mongodb-memory-server";
import { startFinnhubMock } from "./mocks/finnhub-server";
import { assertTestDatabase, seedDatabase } from "./seed";
import { E2E_MONGODB_URI, FINNHUB_MOCK_PORT, MEMORY_MONGO_PORT } from "./env";

// Starts the Finnhub mock and, unless E2E_MONGODB_URI is set (CI service),
// an in-memory MongoDB, then seeds the verified test user. The Next.js server
// (webServer in playwright.config.ts) only connects to MongoDB on its first
// request, so it does not matter which one is up first.
export default async function globalSetup() {
  assertTestDatabase(E2E_MONGODB_URI);

  const mongo = process.env.E2E_MONGODB_URI
    ? null
    : await MongoMemoryServer.create({
        instance: { port: MEMORY_MONGO_PORT, launchTimeout: 60_000 },
      });

  const finnhub = await startFinnhubMock(FINNHUB_MOCK_PORT);
  await seedDatabase(E2E_MONGODB_URI);

  return async () => {
    await finnhub.close();
    await mongo?.stop();
  };
}
