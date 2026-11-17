import "server-only";

import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { mongoClient } from "@/lib/db/mongo-client";

// Built synchronously: `mongoClient.db()` does not connect, so importing this
// module (e.g. while `next build` collects page data) never reaches MongoDB.
// The driver connects on the first auth query.
export const auth = betterAuth({
  database: mongodbAdapter(mongoClient.db()),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    // Email verification is planned for a later change.
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
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
