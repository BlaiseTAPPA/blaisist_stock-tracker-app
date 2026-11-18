import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${root}/` },
      // `server-only` throws outside the `react-server` condition; tests run
      // server modules directly in Node, so map it to its empty export.
      { find: /^server-only$/, replacement: `${root}/node_modules/server-only/empty.js` },
    ],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // mongodb-memory-server downloads a MongoDB binary on its first run.
    hookTimeout: 120_000,
    coverage: {
      provider: "v8",
      include: ["lib/format.ts", "lib/security/**", "lib/validation/**", "lib/finnhub/client.ts"],
      reporter: ["text", "html"],
      thresholds: { lines: 70, functions: 70, branches: 70, statements: 70 },
    },
  },
});
