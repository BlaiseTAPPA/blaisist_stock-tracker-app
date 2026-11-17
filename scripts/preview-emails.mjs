// Renders the welcome and news emails with hostile input, checks the output,
// and writes it to a temporary folder outside the repo for a visual check.
// Nothing is sent and no network or database access happens.
//
//   npm run preview:emails
//
// Requires Node 22.18+ (TypeScript type stripping, `module.registerHooks`).

import { registerHooks } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// The app imports TypeScript files without extensions (bundler resolution).
// Let Node resolve `./render` to `./render.ts`.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (/^\.\.?\//.test(specifier) && !/\.[cm]?[jt]s$/.test(specifier)) {
      try {
        return nextResolve(`${specifier}.ts`, context);
      } catch {
        // Fall through to the default resolution.
      }
    }
    return nextResolve(specifier, context);
  },
});

const { renderWelcomeEmail, renderNewsSummaryEmail } = await import(
  "../lib/nodemailer/render.ts"
);

const DISCLAIMER =
  "This email is for informational purposes only and does not constitute financial advice. Market data may be delayed.";

const trappedName = "<img src=x onerror=alert(1)> $' $& {{intro}}";

const ALLOWED_URL = "https://news.example.com/article?id=1&src=finnhub";

const trappedAiHtml = `\`\`\`html
<p style="color: #CCDADC; background: url(javascript:alert(1))">Intro <strong>text</strong></p>
<script>alert("xss")</script>
<img src="https://evil.example/pixel.png" onerror="alert(1)">
<a href="javascript:alert(1)">js link</a>
<a href="https://evil.example/phishing">off-list link</a>
<a href="http://news.example.com/article?id=1&amp;src=finnhub">http link</a>
<a href="${ALLOWED_URL.replace("&", "&amp;")}" onclick="alert(1)">Read Full Story →</a>
<iframe src="https://evil.example"></iframe>
<p onmouseover="alert(1)">$' $& kept as text</p>
\`\`\``;

const welcome = renderWelcomeEmail({ name: trappedName, intro: trappedAiHtml });
const news = renderNewsSummaryEmail({
  date: "Tuesday, November 17, 2026",
  newsContent: trappedAiHtml,
  allowedUrls: [ALLOWED_URL],
});

const checks = [];
const check = (label, ok) => checks.push({ label, ok });

for (const [email, html] of [["welcome", welcome], ["news", news]]) {
  check(`${email}: disclaimer present`, html.includes(DISCLAIMER));
  check(`${email}: no <script>`, !/<script/i.test(html));
  // The templates have their own logo <img>: only the injected ones must go.
  check(`${email}: no injected <img> or <iframe>`, !/<img[^>]*evil\.example|<iframe/i.test(html));
  check(`${email}: no javascript:`, !/javascript:/i.test(html));
  // Inside a tag only: the escaped name legitimately shows `onerror=` as text.
  check(`${email}: no event handler attribute`, !/<[^>]*\son\w+=/i.test(html));
  check(`${email}: no off-list link`, !/href="https:\/\/evil\.example/.test(html));
  check(`${email}: no http link`, !/href="http:/.test(html));
  check(`${email}: code fences removed`, !html.includes("```"));
  check(`${email}: unsafe inline style dropped`, !/url\(/i.test(html));
  check(`${email}: \`$\` in AI text kept literally`, html.includes("$' $&amp; kept as text"));
  check(`${email}: no placeholder left`, !/\{\{(name|intro|date|newsContent)\}\}/.test(html.replace("$&amp; {{intro}}", "")));
}

check(
  "welcome: name escaped, `$` patterns and `{{intro}}` not interpreted",
  welcome.includes("Welcome aboard &lt;img src=x onerror=alert(1)&gt; $&#39; $&amp; {{intro}}"),
);
check("welcome: no link at all from the AI intro", !welcome.includes("news.example.com"));
check(
  "news: allow-listed link kept with target and rel",
  news.includes(
    `<a href="${ALLOWED_URL.replace("&", "&amp;")}" target="_blank" rel="noopener noreferrer">Read Full Story →</a>`,
  ),
);

const outDir = join(tmpdir(), "signalist-email-preview");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "welcome.html"), welcome);
writeFileSync(join(outDir, "news.html"), news);

for (const { label, ok } of checks) console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
console.log(`\nPreview written to ${outDir}`);

if (checks.some(({ ok }) => !ok)) process.exitCode = 1;
