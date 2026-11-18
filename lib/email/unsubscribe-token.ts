import { createHmac, timingSafeEqual } from "node:crypto";

// Signed, stateless unsubscribe tokens for the links and `List-Unsubscribe`
// headers of the daily digest. The key is derived from BETTER_AUTH_SECRET
// (HMAC with a fixed label), so no new secret is needed and the raw auth
// secret is never used to sign anything else.
//
// Not marked `server-only`: the end-to-end tests import it to build a link.
// It still needs the secret, which only exists on the server.

/** The only list a token can unsubscribe from today. */
export type EmailList = "digest";

const KEY_LABEL = "fingenius:email-unsubscribe:v1";

const deriveKey = (secret: string | undefined) => {
  if (!secret) throw new Error("BETTER_AUTH_SECRET is not set");
  return createHmac("sha256", secret).update(KEY_LABEL).digest();
};

const sign = (payload: string, secret: string | undefined) =>
  createHmac("sha256", deriveKey(secret)).update(payload).digest("base64url");

/** `base64url("digest:<userId>").<signature>`. It does not expire. */
export function createUnsubscribeToken(
  userId: string,
  list: EmailList = "digest",
  secret = process.env.BETTER_AUTH_SECRET,
): string {
  const payload = Buffer.from(`${list}:${userId}`, "utf8").toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

/** Returns the user and list of a valid token, or `null` (malformed, forged, other list). */
export function verifyUnsubscribeToken(
  token: string | null | undefined,
  secret = process.env.BETTER_AUTH_SECRET,
): { userId: string; list: EmailList } | null {
  if (!token || token.length > 512) return null;

  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length > 0) return null;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  const [list, userId] = Buffer.from(payload, "base64url").toString("utf8").split(":");
  if (list !== "digest" || !userId) return null;
  return { userId, list };
}
