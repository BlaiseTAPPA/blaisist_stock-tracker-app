import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/better-auth/auth";

// Better Auth HTTP endpoints (/api/auth/*), needed for the email verification
// link. `proxy.ts` excludes /api from the session redirect.
export const { GET, POST } = toNextJsHandler(auth);
