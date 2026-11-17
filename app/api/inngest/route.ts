import {serve} from "inngest/next";
import {inngest} from "@/lib/inngest/client";
import {sendDailyNewsSummary, sendSignUpEmail} from "@/lib/inngest/functions";

// The signing key is read from the environment by the SDK; never hard-code it.
// Without it (or with dev mode on), requests to this endpoint are not
// signature-checked and anyone could trigger the functions (e.g. the mass
// news email). Fail loudly in Vercel production instead of silently.
if (process.env.VERCEL_ENV === "production") {
    if (process.env.INNGEST_DEV) {
        console.error("[inngest] INNGEST_DEV is set in production: signature verification is disabled. Remove INNGEST_DEV from the Vercel Production environment.");
    }
    if (!process.env.INNGEST_SIGNING_KEY) {
        console.error("[inngest] INNGEST_SIGNING_KEY is missing in production: requests to /api/inngest cannot be verified. Add it to the Vercel Production environment.");
    }
}

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [sendSignUpEmail, sendDailyNewsSummary],
})
