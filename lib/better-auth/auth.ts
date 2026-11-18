import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { after } from "next/server";
import { z } from "zod";
import { mongoClient } from "@/lib/db/mongo-client";
import { inngest } from "@/lib/inngest/client";
import { userVerified } from "@/lib/inngest/events";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/nodemailer";
import {
  countrySchema,
  investmentGoalsSchema,
  preferredIndustrySchema,
  riskToleranceSchema,
} from "@/lib/validation/signup";

/** Where the verification link lands, on success (signed in) or on error (`?error=CODE`). */
export const VERIFY_EMAIL_CALLBACK_URL = "/sign-in";

/** Where the reset link lands: `?token=…` when valid, `?error=INVALID_TOKEN` otherwise. */
export const RESET_PASSWORD_CALLBACK_URL = "/reset-password";

type UserProfile = {
  country?: string | null;
  investmentGoals?: string | null;
  riskTolerance?: string | null;
  preferredIndustry?: string | null;
};

/**
 * Runs `task` after the response is sent, so a reset request answers in the
 * same time whether or not the account exists (no email is sent for an
 * unknown address). Outside a Next.js request (scripts, tests) `after` throws:
 * the task then runs inline.
 */
const runAfterResponse = async (task: () => Promise<void>, label: string) => {
  const safeTask = async () => {
    try {
      await task();
    } catch (e) {
      console.error(`${label} failed`, e);
    }
  };
  try {
    after(safeTask);
  } catch {
    await safeTask();
  }
};

// The validators also cover requests sent straight to the HTTP handler
// (`/api/auth/sign-up/email`, `/api/auth/update-user`), which skip the
// sign-up server action and its zod check.
const profileField = (schema: z.ZodType<string>) =>
  ({
    type: "string",
    required: false,
    input: true,
    validator: { input: schema },
  }) as const;

// Built synchronously: `mongoClient.db()` does not connect, so importing this
// module (e.g. while `next build` collects page data) never reaches MongoDB.
// The driver connects on the first auth query.
export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db()),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  user: {
    // Optional preferences, given at sign-up or later in /settings. Stored so
    // the welcome email, sent only after verification, can be personalised.
    additionalFields: {
      country: profileField(countrySchema),
      investmentGoals: profileField(investmentGoalsSchema),
      riskTolerance: profileField(riskToleranceSchema),
      preferredIndustry: profileField(preferredIndustrySchema),
      // Daily news digest switch (/settings, unsubscribe links). No default:
      // a missing value means "on", so existing accounts need no migration
      // (see `getNewsDigestRecipients` in lib/data/users.ts).
      digestEnabled: {
        type: "boolean",
        required: false,
        input: true,
        validator: { input: z.boolean() },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    // A reset signs every device out: whoever knew the old password loses access.
    revokeSessionsOnPasswordReset: true,
    // Better Auth answers the same way for an unknown address and never
    // calls this for one; sending after the response keeps the timing equal.
    sendResetPassword: async ({ user, url }) => {
      await runAfterResponse(
        () => sendPasswordResetEmail({ email: user.email, name: user.name, url }),
        "Password reset email",
      );
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({ email: user.email, name: user.name, url });
    },
    // Runs once: verifying an already verified address returns early in
    // Better Auth. It is awaited before the session is created, so it must
    // never throw.
    afterEmailVerification: async (user) => {
      // The hook is typed with the base user; the additional fields above are
      // present on the stored document.
      const profile = user as typeof user & UserProfile;
      try {
        await inngest.send(
          userVerified.create({
            userId: profile.id,
            email: profile.email,
            name: profile.name,
            country: profile.country ?? "",
            investmentGoals: profile.investmentGoals ?? "",
            riskTolerance: profile.riskTolerance ?? "",
            preferredIndustry: profile.preferredIndustry ?? "",
          }),
        );
      } catch (e) {
        console.error("Failed to send app/user.created event", e);
      }
    },
  },
  // Applies to requests that go through the HTTP handler
  // (app/api/auth/[...all]/route.ts). Direct `auth.api.*` calls from server
  // actions bypass it: those are limited in lib/auth/rate-limit.ts.
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 3600, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 10 },
    },
  },
  plugins: [nextCookies()],
});
