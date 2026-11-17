import "server-only";

import diagnosticsChannel from "node:diagnostics_channel";

// Opt-in counter of real HTTP requests sent to Finnhub (FINNHUB_DEBUG=1).
//
// Counting inside `fetchJSON` would also count Next.js Data Cache hits, which
// never reach the network. Node's global fetch (undici) publishes every
// outgoing request on the `undici:request:create` diagnostics channel, so we
// count there: cache hits are skipped, background revalidations are included.
//
// Only the path name is logged, never the query string (it holds the token).

type UndiciRequestMessage = { request: { origin?: string | URL; path?: string } };

const FINNHUB_ORIGIN = "https://finnhub.io";
const SUBSCRIBED = Symbol.for("signalist.finnhub.debugCounter");

export function enableFinnhubCallCounter(): void {
  if (process.env.FINNHUB_DEBUG !== "1") return;

  const store = globalThis as typeof globalThis & { [SUBSCRIBED]?: { calls: number } };
  if (store[SUBSCRIBED]) return; // already subscribed (module re-evaluated by HMR)

  const state = { calls: 0 };
  store[SUBSCRIBED] = state;

  diagnosticsChannel.subscribe("undici:request:create", (message) => {
    const { request } = message as UndiciRequestMessage;
    if (!String(request.origin ?? "").startsWith(FINNHUB_ORIGIN)) return;

    state.calls += 1;
    const pathname = (request.path ?? "").split("?")[0];
    console.log(`[finnhub] ${state.calls} calls (${pathname})`);
  });
}
