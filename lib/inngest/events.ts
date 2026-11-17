import { eventType } from "inngest";
import { z } from "zod";

// Typed Inngest events. Using these as triggers types `event.data` in the
// handlers, and `.create()` types (and lets us validate) what we send.
// Schemas must not transform: Inngest requires input and output types to match.

const profileText = z.string().max(200);

/**
 * Sent once, after the user verified their email address
 * (`emailVerification.afterEmailVerification` in lib/better-auth/auth.ts).
 * The name is kept from before verification existed so in-flight events
 * still match.
 */
export const userVerified = eventType("app/user.created", {
  schema: z.object({
    userId: z.string().min(1),
    email: z.email(),
    name: z.string(),
    country: profileText,
    investmentGoals: profileText,
    riskTolerance: profileText,
    preferredIndustry: profileText,
  }),
});

/** Manual trigger for the daily digest (the cron is the usual one). */
export const dailyNewsRequested = eventType("app/send.daily.news");

/** One per recipient and per day, emitted by the daily digest fan-out. */
export const newsDigestRequested = eventType("app/news.digest.requested", {
  schema: z.object({
    userId: z.string().min(1),
    email: z.email(),
    name: z.string(),
    symbols: z.array(z.string()),
    /** UTC day of the digest, `YYYY-MM-DD`. Part of the idempotency key. */
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});
