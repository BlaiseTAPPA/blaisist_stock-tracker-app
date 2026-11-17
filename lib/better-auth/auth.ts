import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { mongoClient } from "@/lib/db/mongo-client";
import { inngest } from "@/lib/inngest/client";
import { userVerified } from "@/lib/inngest/events";
import { sendVerificationEmail } from "@/lib/nodemailer";

/** Where the verification link lands, on success (signed in) or on error (`?error=CODE`). */
export const VERIFY_EMAIL_CALLBACK_URL = "/sign-in";

type UserProfile = {
  country?: string | null;
  investmentGoals?: string | null;
  riskTolerance?: string | null;
  preferredIndustry?: string | null;
};

const profileField = { type: "string", required: false, input: true } as const;

// Built synchronously: `mongoClient.db()` does not connect, so importing this
// module (e.g. while `next build` collects page data) never reaches MongoDB.
// The driver connects on the first auth query.
export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db()),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  user: {
    // Stored at sign-up so the welcome email, sent only after verification,
    // can still be personalised.
    additionalFields: {
      country: profileField,
      investmentGoals: profileField,
      riskTolerance: profileField,
      preferredIndustry: profileField,
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
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
    },
  },
  plugins: [nextCookies()],
});
