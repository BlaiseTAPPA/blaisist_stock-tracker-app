import { Inngest } from "inngest";

export const inngest = new Inngest({
  // Technical app ID, never shown to users: it keeps the pre-rebrand name on
  // purpose, since Inngest identifies the app (and its functions' run history
  // and idempotency keys) by it. Renaming it registers a new app.
  id: "Signalist",
  ai: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY!,
    },
  },
});
