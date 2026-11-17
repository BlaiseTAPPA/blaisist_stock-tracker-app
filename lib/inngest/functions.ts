import { cron } from "inngest";
import { inngest } from "@/lib/inngest/client";
import { dailyNewsRequested, newsDigestRequested, userVerified } from "@/lib/inngest/events";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts";
import { sendNewsSummaryEmail, sendWelcomeEmail } from "@/lib/nodemailer";
import { getNewsDigestRecipients } from "@/lib/data/users";
import { getNews } from "@/lib/finnhub/client";
import { getFormattedTodayDate } from "@/lib/utils";

// Step IDs must stay constant and free of personal data: they are stored in
// the Inngest run history.

const GEMINI_MODEL = "gemini-2.5-flash-lite";

/** Events per `step.sendEvent` call, well below Inngest's request size limit. */
const FAN_OUT_CHUNK_SIZE = 500;

type GeminiResponse = {
    candidates?: { content?: { parts?: ({ text: string } | object)[] } }[];
};

const firstText = (response: GeminiResponse): string | null => {
    const part = response.candidates?.[0]?.content?.parts?.[0];
    return part && "text" in part ? part.text : null;
};

export const sendSignUpEmail = inngest.createFunction(
    {
        id: "sign-up-email",
        triggers: [userVerified],
        // One welcome email per user, even if the event is sent twice.
        idempotency: "event.data.userId",
    },
    async ({ event, step }) => {
        const { email, name, country, investmentGoals, riskTolerance, preferredIndustry } = event.data;

        const userProfile = `
            - Country: ${country}
            - Investment goals: ${investmentGoals}
            - Risk tolerance: ${riskTolerance}
            - Preferred industry: ${preferredIndustry}
        `;

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace("{{userProfile}}", () => userProfile);

        const response = await step.ai.infer("generate-welcome-intro", {
            model: step.ai.models.gemini({ model: GEMINI_MODEL }),
            body: { contents: [{ role: "user", parts: [{ text: prompt }] }] },
        });

        await step.run("send-welcome-email", async () => {
            const intro = firstText(response)
                || "Thanks for joining Signalist. You now have the tools to track markets and follow the stocks you care about.";

            await sendWelcomeEmail({ email, name, intro });
        });

        return { success: true, message: "Welcome email sent successfully" };
    }
);

/**
 * Daily digest, step 1: load every recipient in one query and emit one
 * `app/news.digest.requested` event per recipient. The per-user work happens
 * in `news-digest-user`, so one failure or timeout only affects one user.
 */
export const dailyNewsFanOut = inngest.createFunction(
    {
        id: "daily-news-fanout",
        triggers: [cron("0 12 * * *"), dailyNewsRequested],
    },
    async ({ step }) => {
        // The date is computed inside the step so a replay (even after
        // midnight UTC) reuses the same day, hence the same idempotency keys.
        const { date, recipients } = await step.run("load-recipients", async () => ({
            date: new Date().toISOString().slice(0, 10),
            recipients: await getNewsDigestRecipients(),
        }));

        if (recipients.length === 0) return { sent: 0, date };

        for (let i = 0; i < recipients.length; i += FAN_OUT_CHUNK_SIZE) {
            const chunk = recipients.slice(i, i + FAN_OUT_CHUNK_SIZE);
            await step.sendEvent(
                `fan-out-${i / FAN_OUT_CHUNK_SIZE}`,
                chunk.map(({ id, email, name, symbols }) =>
                    newsDigestRequested.create(
                        { userId: id, email, name, symbols, date },
                        // Same id = same event for Inngest, deduplicated for 24 h.
                        { id: `news-digest-${id}-${date}` },
                    )
                ),
            );
        }

        return { sent: recipients.length, date };
    }
);

/** Daily digest, step 2: news, summary and email for one recipient. */
export const newsDigestForUser = inngest.createFunction(
    {
        id: "news-digest-user",
        triggers: [newsDigestRequested],
        // At most one digest per user and per day, even if the fan-out runs twice.
        idempotency: "event.data.userId + '-' + event.data.date",
        // Finnhub free tier: 60 calls/min. A run makes up to 3 symbol calls
        // plus 1 general-news fallback, so 15 runs/min stays under it (and
        // well under Gmail's sending limits). Excess runs are queued, not dropped.
        throttle: { limit: 15, period: "1m" },
        concurrency: { limit: 5 },
    },
    async ({ event, step }) => {
        const { email, symbols, date } = event.data;

        // getNews falls back to general market news when the symbols have none.
        const articles = await step.run("fetch-news", async () => (await getNews(symbols)).slice(0, 6));

        if (articles.length === 0) return { sent: false, reason: "no-news" };

        // Function replacer: a `$` in article text must not be read as a pattern.
        const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace("{{newsData}}", () => JSON.stringify(articles, null, 2));

        const response = await step.ai.infer("summarize", {
            model: step.ai.models.gemini({ model: GEMINI_MODEL }),
            body: { contents: [{ role: "user", parts: [{ text: prompt }] }] },
        });

        const newsContent = firstText(response) || "No market news.";

        await step.run("send-email", async () => {
            await sendNewsSummaryEmail({
                email,
                date: getFormattedTodayDate(new Date(`${date}T00:00:00Z`)),
                newsContent,
                // Links in the summary must point to these articles.
                allowedUrls: articles.map((article) => article.url),
            });
        });

        return { sent: true };
    }
);
