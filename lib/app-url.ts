/**
 * Public URL of the app, without a trailing slash, for links that leave the
 * app (emails, `List-Unsubscribe` headers). Throws when neither variable is
 * set: a relative or `localhost` link in a real email would be broken.
 */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_BASE_URL || process.env.BETTER_AUTH_URL;
  if (!url) throw new Error("NEXT_PUBLIC_BASE_URL is not set");
  return url.replace(/\/+$/, "");
}

/** Absolute URL of an app path, e.g. `appUrl("/settings")`. */
export const appUrl = (path: string): string => `${getAppUrl()}${path}`;
