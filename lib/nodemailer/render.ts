import { escapeHtml, sanitizeEmailHtml } from "../security/html";
import {
  NEWS_SUMMARY_EMAIL_TEMPLATE,
  RESET_PASSWORD_EMAIL_TEMPLATE,
  VERIFY_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./templates";

// Pure rendering, kept apart from the SMTP transport so
// scripts/preview-emails.mjs can render emails without sending them (hence
// the relative imports).

/**
 * Replaces every `{{key}}` in one pass, with values that must already be
 * safe HTML. The function replacer means `$&`, `` $` `` and `$'` in a value
 * are not read as replacement patterns, and the single pass means a value
 * containing `{{…}}` (say, a user name) is never substituted itself.
 */
const fillTemplate = (template: string, values: Record<string, string>) =>
  template.replace(
    /\{\{(\w+)\}\}/g,
    (placeholder, key: string) =>
      (Object.hasOwn(values, key) ? values[key] : undefined) ?? placeholder,
  );

export const renderWelcomeEmail = ({
  name,
  intro,
  settingsUrl,
}: {
  name: string;
  intro: string;
  /** Transactional email: it links to the email settings, not to an unsubscribe. */
  settingsUrl: string;
}): string =>
  fillTemplate(WELCOME_EMAIL_TEMPLATE, {
    name: escapeHtml(name),
    settingsUrl: escapeHtml(settingsUrl),
    // No URL is given to the model, so the intro keeps no link at all.
    intro: sanitizeEmailHtml(intro),
  });

export const renderNewsSummaryEmail = ({
  date,
  newsContent,
  allowedUrls,
  unsubscribeUrl,
  settingsUrl,
}: {
  date: string;
  newsContent: string;
  /** URLs of the articles given to the model: the only links kept. */
  allowedUrls: readonly string[];
  /** Signed confirmation page link (`/unsubscribe?token=…`). */
  unsubscribeUrl: string;
  settingsUrl: string;
}): string =>
  fillTemplate(NEWS_SUMMARY_EMAIL_TEMPLATE, {
    date: escapeHtml(date),
    unsubscribeUrl: escapeHtml(unsubscribeUrl),
    settingsUrl: escapeHtml(settingsUrl),
    newsContent: sanitizeEmailHtml(newsContent, { allowedUrls }),
  });

export const renderVerificationEmail = ({ name, url }: { name: string; url: string }): string =>
  fillTemplate(VERIFY_EMAIL_TEMPLATE, {
    name: escapeHtml(name),
    url: escapeHtml(url),
  });

export const renderPasswordResetEmail = ({ name, url }: { name: string; url: string }): string =>
  fillTemplate(RESET_PASSWORD_EMAIL_TEMPLATE, {
    name: escapeHtml(name),
    url: escapeHtml(url),
  });
