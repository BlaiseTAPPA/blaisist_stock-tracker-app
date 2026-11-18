// Renders the welcome, news, verification and password reset emails with
// hostile input, checks the output (escaping, sanitizing, unsubscribe links),
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

const {
  renderWelcomeEmail,
  renderNewsSummaryEmail,
  renderVerificationEmail,
  renderPasswordResetEmail,
} = await import("../lib/nodemailer/render.ts");
const templates = await import("../lib/nodemailer/templates.ts");

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

const APP_URL = "https://app.example.com";
const SETTINGS_URL = `${APP_URL}/settings`;
// A token with characters that must be escaped in an attribute.
const UNSUBSCRIBE_URL = 'https://app.example.com/unsubscribe?token=abc"<x>&y=1';
const RESET_URL =
  "https://app.example.com/api/auth/reset-password/tok?callbackURL=%2Freset-password&a=1";

const welcome = renderWelcomeEmail({
  name: trappedName,
  intro: trappedAiHtml,
  appUrl: APP_URL,
  settingsUrl: SETTINGS_URL,
});
const news = renderNewsSummaryEmail({
  date: "Tuesday, November 17, 2026",
  newsContent: trappedAiHtml,
  allowedUrls: [ALLOWED_URL],
  appUrl: APP_URL,
  unsubscribeUrl: UNSUBSCRIBE_URL,
  settingsUrl: SETTINGS_URL,
});
const verification = renderVerificationEmail({ name: trappedName, url: RESET_URL });
const reset = renderPasswordResetEmail({ name: trappedName, url: RESET_URL });

const checks = [];
const check = (label, ok) => checks.push({ label, ok });

for (const [email, html] of [
  ["welcome", welcome],
  ["news", news],
]) {
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
  check(
    `${email}: no placeholder left`,
    !/\{\{(name|intro|date|newsContent)\}\}/.test(html.replace("$&amp; {{intro}}", "")),
  );
}

// Unsubscribe and settings links (FLOW-03).
for (const [name, template] of Object.entries(templates)) {
  check(`template ${name}: no href="#"`, !template.includes('href="#"'));
}
for (const [email, html] of [
  ["welcome", welcome],
  ["news", news],
  ["verification", verification],
  ["reset", reset],
]) {
  check(`${email}: no href="#"`, !html.includes('href="#"'));
  check(`${email}: no placeholder left in a link`, !/href="\{\{/.test(html));
}
check(
  "news: unsubscribe link present and escaped",
  news.includes('href="https://app.example.com/unsubscribe?token=abc&quot;&lt;x&gt;&amp;y=1"'),
);
for (const [email, html] of [
  ["welcome", welcome],
  ["news", news],
]) {
  check(`${email}: app links use the configured URL`, html.includes(`href="${APP_URL}/"`));
  check(`${email}: no hardcoded app domain`, !html.includes("vercel.app"));
}
check("news: settings link present", news.includes(`href="${SETTINGS_URL}"`));
check(
  "welcome: transactional, links to settings and has no unsubscribe",
  welcome.includes(`href="${SETTINGS_URL}"`) && !/unsubscribe/i.test(welcome),
);
for (const [email, html] of [
  ["verification", verification],
  ["reset", reset],
]) {
  check(`${email}: no unsubscribe link`, !/unsubscribe/i.test(html));
  check(
    `${email}: name escaped`,
    html.includes("Hi &lt;img src=x onerror=alert(1)&gt; $&#39; $&amp; {{intro}}"),
  );
  check(
    `${email}: link escaped`,
    html.includes(`href="${RESET_URL.replaceAll("&", "&amp;")}"`) && !html.includes("&a=1"),
  );
}
check("reset: one-time link wording", reset.includes("works once"));

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

const outDir = join(tmpdir(), "fingenius-email-preview");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "welcome.html"), welcome);
writeFileSync(join(outDir, "news.html"), news);
writeFileSync(join(outDir, "verification.html"), verification);
writeFileSync(join(outDir, "reset-password.html"), reset);

for (const { label, ok } of checks) console.log(`${ok ? "PASS" : "FAIL"}  ${label}`);
console.log(`\nPreview written to ${outDir}`);

if (checks.some(({ ok }) => !ok)) process.exitCode = 1;
