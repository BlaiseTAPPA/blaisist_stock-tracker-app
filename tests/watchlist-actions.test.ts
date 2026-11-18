import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { User } from "@/types/user";
import type { toggleWatchlist as ToggleWatchlist } from "@/lib/actions/watchlist.actions";
import type { Watchlist as WatchlistModel } from "@/database/models/watchlist.model";

// Integration test against a throwaway in-memory MongoDB: never the user's.

const session = vi.hoisted(() => ({ user: null as User | null }));

vi.mock("@/lib/auth/session", () => ({
  getSessionUser: vi.fn(async () => session.user),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const ADA: User = { id: "user-ada", name: "Ada", email: "ada@example.com" };

let mongo: MongoMemoryServer;
let toggleWatchlist: typeof ToggleWatchlist;
let Watchlist: typeof WatchlistModel;
let revalidatePath: ReturnType<typeof vi.fn>;

beforeAll(async () => {
  // Generous launch timeout: a cold start on Windows or CI can exceed the 10 s default.
  mongo = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } });
  // Read when lib/db/mongo-client.ts is first imported, hence the dynamic imports.
  process.env.MONGODB_URI = mongo.getUri("fingenius-test");

  ({ toggleWatchlist } = await import("@/lib/actions/watchlist.actions"));
  ({ Watchlist } = await import("@/database/models/watchlist.model"));
  revalidatePath = vi.mocked((await import("next/cache")).revalidatePath);

  const { connectToDatabase } = await import("@/database/mongoose");
  await connectToDatabase();
  // Builds the unique { userId, symbol } index the concurrent test relies on.
  // (`init()` would return the cached result of the attempt made when the
  // model was compiled, before the connection existed.)
  await Watchlist.createIndexes();
});

afterAll(async () => {
  const mongoose = (await import("mongoose")).default;
  await mongoose.disconnect();
  await globalThis.mongoClient?.close();
  await mongo?.stop();
});

beforeEach(async () => {
  session.user = ADA;
  revalidatePath.mockClear();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
  await Watchlist.deleteMany({});
});

const symbolsOf = async (userId: string) =>
  (await Watchlist.find({ userId }).lean()).map((doc) => doc.symbol);

describe("toggleWatchlist", () => {
  it("adds a symbol (normalized) and revalidates the pages that show it", async () => {
    await expect(toggleWatchlist(" aapl ", " Apple Inc. ")).resolves.toEqual({
      ok: true,
      added: true,
    });

    const docs = await Watchlist.find({ userId: ADA.id }).lean();
    expect(docs).toHaveLength(1);
    expect(docs[0]).toMatchObject({ symbol: "AAPL", company: "Apple Inc." });
    expect(revalidatePath.mock.calls.map(([path]) => path)).toEqual([
      "/",
      "/watchlist",
      "/stocks/AAPL",
    ]);
  });

  it("removes a symbol already in the watchlist", async () => {
    await toggleWatchlist("AAPL", "Apple Inc.");

    await expect(toggleWatchlist("AAPL", "Apple Inc.")).resolves.toEqual({
      ok: true,
      added: false,
    });
    expect(await symbolsOf(ADA.id)).toEqual([]);
  });

  it("only touches the signed-in user's watchlist", async () => {
    await Watchlist.create({ userId: "someone-else", symbol: "AAPL", company: "Apple Inc." });

    await expect(toggleWatchlist("AAPL", "Apple Inc.")).resolves.toEqual({ ok: true, added: true });
    expect(await symbolsOf("someone-else")).toEqual(["AAPL"]);
    expect(await symbolsOf(ADA.id)).toEqual(["AAPL"]);
  });

  it("absorbs a concurrent double add: no error, one document", async () => {
    const results = await Promise.all([
      toggleWatchlist("MSFT", "Microsoft"),
      toggleWatchlist("MSFT", "Microsoft"),
    ]);

    expect(results.every((r) => r.ok)).toBe(true);
    expect(await Watchlist.countDocuments({ userId: ADA.id, symbol: "MSFT" })).toBeLessThanOrEqual(
      1,
    );
    expect(console.error).not.toHaveBeenCalled();
  });

  it("refuses an unauthenticated call without touching the database", async () => {
    session.user = null;

    await expect(toggleWatchlist("AAPL", "Apple Inc.")).resolves.toEqual({
      ok: false,
      reason: "unauthenticated",
    });
    expect(await Watchlist.countDocuments()).toBe(0);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it.each([
    ["a malformed symbol", "<script>", "Apple"],
    ["a too-long symbol", "ABCDEFGHIJKLM", "Apple"],
    ["an empty company", "AAPL", "   "],
  ])("rejects %s", async (_label, symbol, company) => {
    await expect(toggleWatchlist(symbol, company)).resolves.toEqual({
      ok: false,
      reason: "invalid",
    });
    expect(await Watchlist.countDocuments()).toBe(0);
  });
});
