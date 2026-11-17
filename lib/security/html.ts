import sanitizeHtml from "sanitize-html";

// Imported by scripts/preview-emails.mjs through Node's type stripping: keep
// this file free of `@/` aliases and non-erasable TypeScript syntax.

/** Escapes text for use in HTML element content or a quoted attribute value. */
export const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const EMAIL_TAGS = ["p", "h3", "h4", "ul", "li", "strong", "em", "span", "div", "a", "br"];

// CSS values made of plain tokens only (`#FDD458`, `16px 0 20px 0`,
// `1px solid #374151`, `!important`). No parentheses, colons or quotes, so no
// `url(…)`, `expression(…)` or `javascript:` can hide in a style attribute.
const SAFE_CSS_VALUE = /^[#\w\s.,%!-]+$/;

const SAFE_STYLES: Record<string, RegExp[]> = Object.fromEntries(
  [
    "background-color",
    "border",
    "border-radius",
    "border-top",
    "color",
    "font-size",
    "font-weight",
    "line-height",
    "list-style",
    "margin",
    "margin-bottom",
    "margin-left",
    "margin-right",
    "margin-top",
    "padding",
    "padding-left",
    "text-align",
    "text-decoration",
  ].map((property) => [property, [SAFE_CSS_VALUE]]),
);

/** Normalises a URL for comparison; returns null when it is not an https URL. */
const toHttpsUrl = (value: string): string | null => {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
};

/** Removes the markdown code fences (```html … ```) the model sometimes adds. */
const stripCodeFences = (html: string): string => html.replace(/```[a-z]*/gi, "").trim();

/**
 * Sanitizes model-generated HTML before it goes into an email.
 *
 * Only the tags and inline styles our prompts ask for survive. A link is kept
 * only if it points to one of `allowedUrls` (the article URLs we gave the
 * model) over https; any other link is unwrapped and keeps its text. This
 * stops a prompt injection in third-party news from putting arbitrary links
 * in emails sent under our name.
 */
export const sanitizeEmailHtml = (
  html: string,
  { allowedUrls = [] }: { allowedUrls?: readonly string[] } = {},
): string => {
  const allowed = new Set(allowedUrls.map(toHttpsUrl).filter((url): url is string => url !== null));

  return sanitizeHtml(stripCodeFences(html), {
    allowedTags: EMAIL_TAGS,
    allowedAttributes: {
      "*": ["style", "class"],
      a: ["href", "target", "rel"],
    },
    allowedStyles: { "*": SAFE_STYLES },
    allowedSchemes: ["https"],
    allowedSchemesAppliedToAttributes: ["href"],
    allowProtocolRelative: false,
    // Text of dropped tags is kept, except inside script, style, etc.
    disallowedTagsMode: "discard",
    transformTags: {
      a: (_tagName, attribs) => {
        const href = attribs.href ? toHttpsUrl(attribs.href) : null;
        if (!href || !allowed.has(href)) {
          const { style, class: className } = attribs;
          return {
            tagName: "span",
            attribs: {
              ...(style ? { style } : {}),
              ...(className ? { class: className } : {}),
            },
          };
        }
        return {
          tagName: "a",
          attribs: {
            ...attribs,
            href,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        };
      },
    },
  });
};
