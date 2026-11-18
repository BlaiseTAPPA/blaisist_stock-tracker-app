"use server";

import { unsubscribeFromDigest, type UnsubscribeResult } from "@/lib/email/unsubscribe";

/**
 * The button of the /unsubscribe page. Public on purpose (the person may not
 * be signed in): the signed token is what authorizes the change.
 */
export const confirmDigestUnsubscribe = async (token: string): Promise<UnsubscribeResult> =>
  unsubscribeFromDigest(typeof token === "string" ? token : null);
