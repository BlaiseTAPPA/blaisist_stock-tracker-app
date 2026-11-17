import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/better-auth/auth";

// Better Auth HTTP endpoints (/api/auth/*), rate-limited by Better Auth
// (database storage). Required for the email verification link once it is
// added. `proxy.ts` excludes /api from the session redirect.
export const { GET, POST } = toNextJsHandler(auth);
