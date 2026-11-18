import { describe, expect, it } from "vitest";
import { escapeHtml, sanitizeEmailHtml } from "@/lib/security/html";

const ARTICLE = "https://news.example.com/apple-earnings";

describe("escapeHtml", () => {
  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<b>"Tom" & 'Jerry'</b>`)).toBe(
      "&lt;b&gt;&quot;Tom&quot; &amp; &#39;Jerry&#39;&lt;/b&gt;",
    );
  });

  it("escapes & first, so existing entities are not double-decoded", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });

  it("keeps template placeholders inert", () => {
    expect(escapeHtml("$& {{name}} $1")).toBe("$&amp; {{name}} $1");
  });
});

describe("sanitizeEmailHtml", () => {
  it("keeps the tags and inline styles the prompts ask for", () => {
    const html =
      '<h3 style="color: #FDD458; margin: 16px 0 20px 0">Market</h3><p>Up <strong>2%</strong></p>';
    expect(sanitizeEmailHtml(html)).toBe(
      '<h3 style="color:#FDD458;margin:16px 0 20px 0">Market</h3><p>Up <strong>2%</strong></p>',
    );
  });

  it("removes scripts and their content", () => {
    expect(sanitizeEmailHtml("<p>Hi</p><script>alert(1)</script>")).toBe("<p>Hi</p>");
  });

  it("removes images, iframes, forms and event handlers", () => {
    const out = sanitizeEmailHtml(
      '<p onclick="steal()">A</p><img src="https://x.test/p.gif" onerror="steal()"><iframe src="https://evil.test"></iframe><form action="https://evil.test"><input name="pw"></form>',
    );
    expect(out).toBe("<p>A</p>");
  });

  it("drops style values that can load or run anything", () => {
    const out = sanitizeEmailHtml(
      '<p style="background-image: url(https://evil.test/t.png); color: expression(alert(1)); font-size: 14px">A</p>',
    );
    expect(out).toBe('<p style="font-size:14px">A</p>');
  });

  it("keeps a link to an allowed article over https, with safe attributes", () => {
    const out = sanitizeEmailHtml(`<a href="${ARTICLE}" target="_self">Read</a>`, {
      allowedUrls: [ARTICLE],
    });
    expect(out).toBe(`<a href="${ARTICLE}" target="_blank" rel="noopener noreferrer">Read</a>`);
  });

  it.each([
    ["an unknown domain", "https://phishing.test/login"],
    ["javascript:", "javascript:alert(1)"],
    ["data:", "data:text/html;base64,PHNjcmlwdD4="],
    ["http (no TLS)", ARTICLE.replace("https:", "http:")],
    ["a protocol-relative URL", "//news.example.com/apple-earnings"],
  ])("unwraps a link to %s and keeps its text", (_label, href) => {
    const out = sanitizeEmailHtml(`<a href="${href}" style="color: #FDD458">Read</a>`, {
      allowedUrls: [ARTICLE],
    });
    expect(out).toBe('<span style="color:#FDD458">Read</span>');
  });

  it("ignores allowed URLs that are not https", () => {
    const out = sanitizeEmailHtml('<a href="javascript:alert(1)">x</a>', {
      allowedUrls: ["javascript:alert(1)"],
    });
    expect(out).toBe("<span>x</span>");
  });

  it("strips the markdown code fences the model sometimes adds", () => {
    expect(sanitizeEmailHtml("```html\n<p>Hi</p>\n```")).toBe("<p>Hi</p>");
  });
});
