import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { COLORS, CSS_VARIABLES } from "@/lib/design-tokens";

const css = readFileSync(fileURLToPath(new URL("../app/globals.css", import.meta.url)), "utf8");
const rootBlock = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? "";

const cssValue = (name: string) =>
  rootBlock.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))?.[1]?.toLowerCase();

// WCAG 2.1 relative luminance and contrast ratio.
const channel = (hex: string, offset: number) => {
  const c = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) =>
  0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5);
const contrast = (a: string, b: string) => {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

describe("design tokens", () => {
  it.each(Object.entries(CSS_VARIABLES))("%s matches globals.css", (key, variable) => {
    expect(cssValue(variable)).toBe(COLORS[key as keyof typeof COLORS]);
  });

  const surfaces = [COLORS.surface, COLORS.surfaceRaised, COLORS.surfaceHover];

  it.each([
    ["text", COLORS.text],
    ["text-secondary", COLORS.textSecondary],
    ["text-muted", COLORS.textMuted],
    ["gain", COLORS.gain],
    ["loss", COLORS.loss],
    ["accent", COLORS.accent],
  ])("%s text passes WCAG AA (4.5:1) on every surface", (_, color) => {
    for (const surface of surfaces) expect(contrast(color, surface)).toBeGreaterThanOrEqual(4.5);
  });

  it("text on the brand yellow passes WCAG AA", () => {
    expect(contrast(COLORS.onAccent, COLORS.accent)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(COLORS.onAccent, COLORS.accentHover)).toBeGreaterThanOrEqual(4.5);
  });

  it("form control boundaries reach 3:1 (WCAG 1.4.11)", () => {
    expect(contrast(COLORS.controlBorder, COLORS.surface)).toBeGreaterThanOrEqual(3);
    expect(contrast(COLORS.controlBorder, COLORS.surfaceRaised)).toBeGreaterThanOrEqual(3);
  });

  it("keeps the neutral scale monotone, darkest surface to brightest text", () => {
    const scale = [
      COLORS.surface,
      COLORS.surfaceRaised,
      COLORS.surfaceHover,
      COLORS.border,
      COLORS.controlBorder,
      COLORS.textMuted,
      COLORS.textSecondary,
      COLORS.text,
    ].map(luminance);
    expect([...scale].sort((a, b) => a - b)).toEqual(scale);
  });
});
