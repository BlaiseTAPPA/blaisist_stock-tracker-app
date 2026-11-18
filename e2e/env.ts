// Ports and URLs shared by playwright.config.ts and the global setup.

export const APP_PORT = 3100;
export const APP_URL = `http://localhost:${APP_PORT}`;

export const FINNHUB_MOCK_PORT = 4010;
export const FINNHUB_MOCK_URL = `http://127.0.0.1:${FINNHUB_MOCK_PORT}/api/v1`;

/** Port of the in-memory MongoDB started when E2E_MONGODB_URI is not set. */
export const MEMORY_MONGO_PORT = 27018;

/**
 * The CI points this at its MongoDB service; locally an in-memory server is
 * started on MEMORY_MONGO_PORT. Never the database from `.env.local`.
 */
export const E2E_MONGODB_URI =
  process.env.E2E_MONGODB_URI || `mongodb://127.0.0.1:${MEMORY_MONGO_PORT}/fingenius-e2e`;
