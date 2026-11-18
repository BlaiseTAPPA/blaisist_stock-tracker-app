import type { Page } from "@playwright/test";

// Playwright compiles specs to CommonJS, so `require.resolve` is available.
const axePath = require.resolve("axe-core/axe.min.js");

type AxeViolation = {
  id: string;
  impact: string | null;
  help: string;
  nodes: { target: string[] }[];
};

/** axe-core (WCAG 2.1 A/AA rules) on `selector`, serious and critical violations only. */
export async function seriousViolations(page: Page, selector = "html") {
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(async (context) => {
    // Injected by the script tag above.
    const axe = (window as unknown as { axe: { run: (...args: unknown[]) => Promise<unknown> } })
      .axe;
    const result = (await axe.run(context, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    })) as { violations: AxeViolation[] };
    return result.violations.map(({ id, impact, help, nodes }) => ({
      id,
      impact,
      help,
      // Selectors of the failing elements, so a failure says where to look.
      targets: nodes.map((node) => node.target.join(" ")),
    }));
  }, selector);
  return violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}
