"use server";

import type { StockSearchResult } from "@/types/stock";
import { z } from "zod";
import { requireUser, UnauthenticatedError } from "@/lib/auth/session";
import { searchStocks } from "@/lib/finnhub/client";

// Every export of a "use server" file is a public POST endpoint: keep this file
// to authenticated, validated actions. Finnhub access lives in
// `lib/finnhub/client.ts` (server-only).

const searchQuery = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^[\p{L}\p{N} .\-&]+$/u);

// Simple per-user sliding-window throttle, kept in memory.
//
// Limits: the map lives in a single server instance. On serverless (Vercel),
// each lambda instance has its own map and loses it on cold start, so the
// effective limit is "20 req / 10 s per user per instance". This protects the
// Finnhub quota against one client hammering the action, not against a
// distributed attack. A shared store (e.g. Upstash Redis) is needed for that.
const THROTTLE_WINDOW_MS = 10_000;
const THROTTLE_MAX_REQUESTS = 20;
const requestLog = new Map<string, number[]>();

function isThrottled(userId: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(userId) ?? []).filter(
    (t) => now - t < THROTTLE_WINDOW_MS,
  );

  if (recent.length >= THROTTLE_MAX_REQUESTS) {
    requestLog.set(userId, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(userId, recent);

  // Keep the map bounded: drop users with no request in the current window.
  if (requestLog.size > 1_000) {
    for (const [id, times] of requestLog) {
      if (times.every((t) => now - t >= THROTTLE_WINDOW_MS)) requestLog.delete(id);
    }
  }

  return false;
}

export async function searchStocksAction(
  query: string,
): Promise<StockSearchResult[]> {
  let userId: string;
  try {
    ({ id: userId } = await requireUser());
  } catch (e) {
    if (e instanceof UnauthenticatedError) return [];
    throw e;
  }

  const parsed = searchQuery.safeParse(query);
  if (!parsed.success) return [];

  if (isThrottled(userId)) return [];

  return searchStocks(parsed.data);
}
