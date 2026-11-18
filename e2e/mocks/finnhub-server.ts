import { createServer, type Server } from "node:http";

// Minimal stand-in for the Finnhub REST API (https://finnhub.io/api/v1), used by
// the end-to-end tests through FINNHUB_BASE_URL. It answers every endpoint the
// app calls with fixed data, so the tests never spend the real quota and never
// depend on market hours.

const PROFILES: Record<string, { name: string; exchange: string }> = {
  AAPL: { name: "Apple Inc", exchange: "NASDAQ NMS - GLOBAL MARKET" },
  MSFT: { name: "Microsoft Corp", exchange: "NASDAQ NMS - GLOBAL MARKET" },
};

const quote = (symbol: string) => {
  // Deterministic, symbol-dependent price so cards are distinguishable.
  const base = 100 + [...symbol].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) / 10;
  return {
    c: Number(base.toFixed(2)),
    d: 1.25,
    dp: 0.64,
    h: base + 2,
    l: base - 2,
    o: base - 1,
    pc: base - 1.25,
    t: Math.floor(Date.now() / 1000) - 60,
  };
};

const article = (id: number, related = "") => ({
  id,
  category: related ? "company" : "general",
  datetime: Math.floor(Date.now() / 1000) - id * 3600,
  headline: `Mock headline ${id}`,
  image: "",
  related,
  source: "Mock Wire",
  summary: `Mock summary for article ${id}.`,
  url: `https://news.example.com/articles/${id}`,
});

type Handler = (params: URLSearchParams) => unknown;

const ROUTES: Record<string, Handler> = {
  "/quote": (p) => quote(p.get("symbol") ?? ""),
  "/stock/profile2": (p) => {
    const symbol = p.get("symbol") ?? "";
    const profile = PROFILES[symbol];
    return profile ? { ...profile, ticker: symbol, currency: "USD", country: "US", logo: "" } : {};
  },
  "/stock/metric": (p) => ({
    symbol: p.get("symbol"),
    metricType: "all",
    metric: { marketCapitalization: 3_000_000, peBasicExclExtraTTM: 30.5 },
  }),
  "/stock/market-status": () => ({
    exchange: "US",
    holiday: null,
    isOpen: false,
    session: null,
    timezone: "America/New_York",
    t: Math.floor(Date.now() / 1000),
  }),
  "/news": () => [1, 2, 3, 4, 5, 6].map((id) => article(id)),
  "/company-news": (p) => [1, 2].map((id) => article(100 + id, p.get("symbol") ?? "")),
  "/search": (p) => {
    const q = (p.get("q") ?? "").toUpperCase();
    const result = Object.entries(PROFILES)
      .filter(([symbol, { name }]) => symbol.includes(q) || name.toUpperCase().includes(q))
      .map(([symbol, { name }]) => ({
        symbol,
        displaySymbol: symbol,
        description: name.toUpperCase(),
        type: "Common Stock",
      }));
    return { count: result.length, result };
  },
};

export type FinnhubMock = {
  url: string;
  /** Number of API requests served so far (proves the app used the mock). */
  requestCount: () => number;
  close: () => Promise<void>;
};

export function startFinnhubMock(port: number): Promise<FinnhubMock> {
  let requests = 0;

  const server: Server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    if (url.pathname === "/__stats") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ requests }));
      return;
    }

    const handler = ROUTES[url.pathname.replace(/^\/api\/v1/, "")];
    if (!url.searchParams.get("token")) {
      res.writeHead(401, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Please use an API key." }));
      return;
    }
    if (!handler) {
      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
      return;
    }

    requests += 1;
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(handler(url.searchParams)));
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () =>
      resolve({
        url: `http://127.0.0.1:${port}/api/v1`,
        requestCount: () => requests,
        close: () => new Promise((done) => server.close(() => done())),
      }),
    );
  });
}
