import "server-only";

import { createHash } from "node:crypto";
import { MongoServerError, type Collection } from "mongodb";
import { headers } from "next/headers";
import { getIP } from "better-auth/api";
import { auth } from "@/lib/better-auth/auth";
import { mongoClient } from "@/lib/db/mongo-client";

/**
 * Rate limiting for the auth server actions.
 *
 * Better Auth's own limiter only runs in its HTTP router (`onRequest`), so it
 * does not see the `auth.api.*` calls our server actions make. This module
 * applies equivalent limits per client IP and per email address, stored in
 * MongoDB so they hold across serverless instances.
 */

type RateLimitDoc = { _id: string; count: number; expiresAt: Date };
type Rule = { window: number; max: number };

export type AuthRateLimitAction = "sign-in" | "sign-up" | "resend-verification";

// `window` is in seconds. Every attempt counts, successful or not.
const RULES: Record<AuthRateLimitAction, { ip: Rule; email: Rule }> = {
  "sign-in": { ip: { window: 60, max: 5 }, email: { window: 60, max: 5 } },
  "sign-up": { ip: { window: 3600, max: 5 }, email: { window: 3600, max: 5 } },
  // Each call can send an email to the address: keep it tight.
  "resend-verification": {
    ip: { window: 60, max: 3 },
    email: { window: 3600, max: 3 },
  },
};

const COLLECTION = "auth_rate_limit";

let indexReady: Promise<unknown> | null = null;

const getCollection = async (): Promise<Collection<RateLimitDoc>> => {
  const collection = mongoClient.db().collection<RateLimitDoc>(COLLECTION);
  // TTL index: MongoDB deletes a bucket once its window has expired.
  indexReady ??= collection
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    .catch((e: unknown) => {
      indexReady = null;
      throw e;
    });
  await indexReady;
  return collection;
};

/** Atomically counts one hit for `key`; returns the seconds to wait if over the limit. */
const hit = async (key: string, rule: Rule, retry = true): Promise<number | null> => {
  const collection = await getCollection();
  const now = new Date();
  // True for a new bucket (no `expiresAt` yet) or an expired one.
  const windowOver = { $lte: [{ $ifNull: ["$expiresAt", now] }, now] };

  try {
    const doc = await collection.findOneAndUpdate(
      { _id: key },
      [
        {
          $set: {
            count: { $cond: [windowOver, 1, { $add: ["$count", 1] }] },
            expiresAt: {
              $cond: [windowOver, new Date(now.getTime() + rule.window * 1000), "$expiresAt"],
            },
          },
        },
      ],
      { upsert: true, returnDocument: "after" },
    );

    if (!doc || doc.count <= rule.max) return null;
    return Math.max(1, Math.ceil((doc.expiresAt.getTime() - now.getTime()) / 1000));
  } catch (e) {
    // Two concurrent upserts on a new key: one loses on the unique `_id`.
    // The document exists now, so a retry increments it.
    if (retry && e instanceof MongoServerError && e.code === 11000) {
      return hit(key, rule, false);
    }
    throw e;
  }
};

const hashEmail = (email: string) =>
  createHash("sha256").update(email.trim().toLowerCase()).digest("hex");

const formatWait = (seconds: number) =>
  seconds < 90
    ? `${seconds} second${seconds === 1 ? "" : "s"}`
    : `${Math.ceil(seconds / 60)} minutes`;

/**
 * Counts an attempt of `action` for the current request's IP and for `email`.
 * Returns an error message to show the user when a limit is exceeded, or
 * `null` when the attempt may proceed.
 */
export const checkAuthRateLimit = async (
  action: AuthRateLimitAction,
  email: string,
): Promise<string | null> => {
  const rules = RULES[action];

  try {
    // Same IP resolution as Better Auth (x-forwarded-for by default, which
    // Vercel sets to the client IP). `null` when no trustworthy IP is found:
    // the per-email limit still applies.
    const ip = getIP(new Headers(await headers()), auth.options);

    const checks: Array<[string, Rule]> = [
      ...(ip ? [[`${action}|ip|${ip}`, rules.ip] as [string, Rule]] : []),
      [`${action}|email|${hashEmail(email)}`, rules.email],
    ];

    for (const [key, rule] of checks) {
      const retryAfter = await hit(key, rule);
      if (retryAfter !== null) {
        return `Too many attempts. Please wait ${formatWait(retryAfter)} and try again.`;
      }
    }
    return null;
  } catch (e) {
    // Fail open: if the store is unreachable, the auth call itself will fail
    // on the same database and report the error.
    console.error("Auth rate limit check failed", e);
    return null;
  }
};
