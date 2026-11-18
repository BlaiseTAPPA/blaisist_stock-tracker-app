# FinGenius

FinGenius is a stock market tracker. After creating an account (with email verification), you can:

- see a dashboard with a market summary, popular stocks, your watchlist and the latest market news;
- search any listed company with **⌘K / Ctrl+K** and open its page: price, interactive charts, technical analysis, company profile and financials;
- build a watchlist and sort it by date added, name or daily change;
- browse news and a market heatmap;
- get a personalised welcome email and a daily news digest, both written by AI from your profile and your watchlist.

> FinGenius shows market data for information only. It is not financial advice.

## Stack

| Area            | Technology                                                                       |
| --------------- | -------------------------------------------------------------------------------- |
| Framework       | [Next.js 16](https://nextjs.org) (App Router, Server Components, Server Actions) |
| UI              | React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (Radix), cmdk, Sonner  |
| Auth            | [Better Auth](https://better-auth.com) (email + password, email verification)    |
| Database        | MongoDB, Mongoose (shares Better Auth's connection pool)                         |
| Market data     | [Finnhub](https://finnhub.io) REST API (server-side only), TradingView widgets   |
| Background jobs | [Inngest](https://www.inngest.com) v4 (welcome email, daily news digest fan-out) |
| AI              | Google Gemini, through Inngest's AI step                                         |
| Email           | Nodemailer over Gmail                                                            |
| Tests           | Vitest (unit and integration, mongodb-memory-server), Playwright (end-to-end)    |

## Prerequisites

- **Node.js 22** or later, and npm.
- **MongoDB**: a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (the free tier works) or a local `mongod`.
- **Finnhub** account: a free API key from the [dashboard](https://finnhub.io/dashboard).
- **Google Gemini** API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
- **Gmail** account with 2-step verification and an [app password](https://myaccount.google.com/apppasswords) (not your account password), used to send emails.
- **Inngest**: nothing to create for local development (the dev server runs locally). An [Inngest](https://app.inngest.com) account for production.

## Getting started

```bash
git clone https://github.com/BlaiseTAPPA/blaisist_stock-tracker-app.git
cd blaisist_stock-tracker-app
npm install
cp .env.example .env.local   # then fill in the values
npm run test:db              # checks that MONGODB_URI is reachable
```

Every variable is described in [`.env.example`](.env.example). For local development:

- `NEXT_PUBLIC_BASE_URL` and `BETTER_AUTH_URL`: `http://localhost:3000`;
- `BETTER_AUTH_SECRET`: the output of `openssl rand -base64 32`;
- `INNGEST_DEV=1`, and leave `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` empty.

Then start the app and the Inngest dev server, in two terminals:

```bash
npm run dev                                          # http://localhost:3000
npx inngest-cli dev -u http://localhost:3000/api/inngest   # http://localhost:8288
```

Sign up at <http://localhost:3000/sign-up>. A verification email is sent to the address you entered. Once you click its link, you are signed in and the welcome email is queued in Inngest. The Inngest dev server UI (port 8288) shows the runs. You can also trigger the daily digest from there (function `daily-news-fanout`).

## Scripts

| Command                  | What it does                                                              |
| ------------------------ | ------------------------------------------------------------------------- |
| `npm run dev`            | Development server on port 3000                                           |
| `npm run build`          | Production build                                                          |
| `npm start`              | Serves the production build                                               |
| `npm run lint`           | ESLint                                                                    |
| `npm run format`         | Formats the code with Prettier                                            |
| `npm run format:check`   | Checks the formatting (run in CI)                                         |
| `npm test`               | Unit and integration tests (Vitest)                                       |
| `npm run test:watch`     | Vitest in watch mode                                                      |
| `npm run test:coverage`  | Tests with a coverage report in `coverage/` (fails under 70 %)            |
| `npm run test:e2e`       | End-to-end smoke test (Playwright), see below                             |
| `npm run test:db`        | Checks the MongoDB connection (`.env.local`, then `.env`)                 |
| `npm run preview:emails` | Renders the email templates with hostile inputs and checks the sanitizing |

Type checking: `npx tsc --noEmit`.

## Tests

**Unit and integration** (`tests/`, Vitest, Node environment): financial formatting, HTML escaping and sanitizing of AI-written emails, sign-up and search validation, the Finnhub client (timeouts, 429, retries, news selection) with a mocked `fetch`, and the watchlist toggle against an in-memory MongoDB. The first run downloads a MongoDB binary (about 100 MB, cached in `~/.cache/mongodb-binaries`).

**End-to-end** (`e2e/`, Playwright): sign in → dashboard → ⌘K search for "AAPL" → stock page → add to watchlist → `/watchlist` → remove → empty state.

```bash
npx playwright install chromium   # once
npm run test:e2e
```

The test builds the app and serves it on port 3100 with its own environment, set in [`playwright.config.ts`](playwright.config.ts). Those values take precedence over `.env.local`, so the test never touches your database or your Finnhub quota:

- Finnhub is replaced by a local mock ([`e2e/mocks/finnhub-server.ts`](e2e/mocks/finnhub-server.ts), port 4010) through `FINNHUB_BASE_URL`;
- MongoDB is an in-memory server on port 27018, or `E2E_MONGODB_URI` if set (the CI uses a MongoDB service). [`e2e/seed.ts`](e2e/seed.ts) drops it and creates an already verified user. It refuses any database that isn't local or whose name doesn't contain `e2e`;
- the browser blocks every third-party request (TradingView widgets, logos, images).

The e2e build goes to `.next-e2e/` (`NEXT_DIST_DIR`), so it never replaces the `.next/` build used by `npm start`.

## Project structure

```
app/
  (auth)/            sign-in and sign-up pages
  (root)/            signed-in pages: dashboard, stocks/[symbol], watchlist, news, heatmap
  api/auth/          Better Auth HTTP handler
  api/inngest/       Inngest endpoint (functions are registered here)
components/          UI components (dashboard/, forms/, search/, ui/ = shadcn)
database/            Mongoose connection and models
hooks/               client hooks (TradingView widget loader, current time)
lib/
  actions/           Server Actions ("use server"): auth, watchlist, search
  auth/              session helpers, rate limiting of the auth actions
  better-auth/       Better Auth configuration
  data/              server-only data access (watchlist reads)
  db/                shared MongoClient, MongoDB error helpers
  finnhub/           server-only Finnhub client, cache lifetimes, errors
  inngest/           Inngest client, events, functions and AI prompts
  nodemailer/        email transport and templates
  security/          HTML escaping and sanitizing of AI-written emails
  stocks/            symbol normalisation, stock page loader
  validation/        zod schemas shared by the client and the server
  format.ts          price, percent, market cap and ratio formatting
  time.ts            browser-side date formatting
types/               shared TypeScript types
proxy.ts             redirects signed-out visitors to /sign-in (Next 16 "proxy", formerly middleware)
scripts/             one-off and maintenance scripts
tests/, e2e/         Vitest and Playwright tests
```

## Security rules

- **Secrets stay on the server.** Modules that read a secret or call Finnhub, MongoDB or Better Auth start with `import "server-only"`, so importing them from a client component fails the build. Only `NEXT_PUBLIC_*` variables reach the browser, and none of them is a secret.
- **Every Server Action is a public endpoint.** Each export of a `"use server"` file checks the session (`getSessionUser` / `requireUser`), validates its input with zod, and only acts on the signed-in user's data. Reads that don't need to be called from the client live in `lib/data/`, not in action files.
- **Auth is rate limited**, both on the HTTP handler (Better Auth, stored in MongoDB) and in the auth actions (`lib/auth/rate-limit.ts`). Email verification is required to sign in.
- **AI output is untrusted.** HTML written by Gemini is sanitized (`lib/security/html.ts`) before it goes into an email: only a small set of tags and styles is kept, and links are kept only when they point to the articles we gave the model.
- **The Finnhub token never appears in logs or errors**: error messages only carry the endpoint path.

## Deployment (Vercel)

1. Import the repository in Vercel (framework preset: Next.js).
2. Add the environment variables below for Production (and Preview if you use it).
3. Install the [Inngest Vercel integration](https://vercel.com/integrations/inngest), or copy the keys from the Inngest dashboard. After the first deployment, check in Inngest that the app is synced and its functions are listed.
4. In MongoDB Atlas, allow connections from Vercel (Network Access).

Environment variable checklist:

| Variable                                   | Production                                                   |
| ------------------------------------------ | ------------------------------------------------------------ |
| `NEXT_PUBLIC_BASE_URL`                     | Required: production URL, e.g. `https://your-app.vercel.app` |
| `BETTER_AUTH_URL`                          | Required: same value                                         |
| `BETTER_AUTH_SECRET`                       | Required: a new random secret, not the local one             |
| `MONGODB_URI`                              | Required                                                     |
| `FINNHUB_API_KEY`                          | Required                                                     |
| `GEMINI_API_KEY`                           | Required                                                     |
| `NODEMAILER_EMAIL`, `NODEMAILER_PASSWORD`  | Required                                                     |
| `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Required                                                     |
| `INNGEST_DEV`                              | **Must not be set**: it disables signature verification      |
| `FINNHUB_BASE_URL`, `FINNHUB_DEBUG`        | Not set                                                      |

## Continuous integration

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs on every pull request and on pushes to `main`:

- **Lint, typecheck & build**: `format:check`, `lint`, `tsc --noEmit`, `next build`;
- **Unit & integration tests**: `npm run test:coverage`;
- **End-to-end smoke test**: Playwright with a MongoDB service and the Finnhub mock.
