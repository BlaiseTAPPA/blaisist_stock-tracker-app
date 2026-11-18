import "server-only";

import { auth } from "@/lib/better-auth/auth";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribe-token";

export type UnsubscribeResult = "unsubscribed" | "invalid" | "error";

/**
 * Turns the daily digest off for the user a signed token names. No session
 * is needed: the token is the proof. Idempotent, so a second click (or the
 * mail client's one-click POST after the link) reports success again.
 */
export async function unsubscribeFromDigest(token: string | null): Promise<UnsubscribeResult> {
  const payload = verifyUnsubscribeToken(token);
  if (!payload) return "invalid";

  try {
    const ctx = await auth.$context;
    const user = await ctx.internalAdapter.updateUser(payload.userId, { digestEnabled: false });
    // A deleted account has nothing left to unsubscribe from.
    return user ? "unsubscribed" : "invalid";
  } catch (e) {
    console.error("Digest unsubscribe failed", e);
    return "error";
  }
}
