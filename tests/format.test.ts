import { describe, expect, it } from "vitest";
import {
  formatMarketCap,
  formatPercent,
  formatPrice,
  formatRatio,
  PLACEHOLDER,
} from "@/lib/format";

const MINUS = "−";
const invalid = [undefined, null, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];

describe("formatPrice", () => {
  it("formats USD with two decimals by default", () => {
    expect(formatPrice(1234.5)).toBe("$1,234.50");
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("rounds to the cent", () => {
    expect(formatPrice(10.005)).toBe("$10.01");
    expect(formatPrice(10.004)).toBe("$10.00");
  });

  it("uses the listing currency", () => {
    expect(formatPrice(98.1, "EUR")).toBe("€98.10");
    expect(formatPrice(1500, "JPY")).toBe("¥1,500.00");
  });

  it("falls back to USD for a malformed currency code", () => {
    expect(formatPrice(5, "")).toBe("$5.00");
    expect(formatPrice(5, "not-a-code")).toBe("$5.00");
  });

  it.each(invalid)("returns the placeholder for %s", (value) => {
    expect(formatPrice(value)).toBe(PLACEHOLDER);
  });
});

describe("formatPercent", () => {
  it("signs gains with + and losses with a true minus", () => {
    expect(formatPercent(1.234)).toBe("+1.23%");
    expect(formatPercent(-0.456)).toBe(`${MINUS}0.46%`);
  });

  it("gives no sign to a value that rounds to zero", () => {
    expect(formatPercent(0)).toBe("0.00%");
    expect(formatPercent(0.004)).toBe("0.00%");
    expect(formatPercent(-0.004)).toBe("0.00%");
  });

  it("groups thousands", () => {
    expect(formatPercent(1234.5)).toBe("+1,234.50%");
  });

  it.each(invalid)("returns the placeholder for %s", (value) => {
    expect(formatPercent(value)).toBe(PLACEHOLDER);
  });
});

describe("formatMarketCap", () => {
  it("takes millions and uses compact notation", () => {
    expect(formatMarketCap(3_100_000)).toBe("$3.1T");
    expect(formatMarketCap(2_345.678)).toBe("$2.35B");
    expect(formatMarketCap(850)).toBe("$850M");
  });

  it("uses the listing currency", () => {
    expect(formatMarketCap(1_000, "EUR")).toBe("€1B");
  });

  it.each([...invalid, 0, -5])("returns the placeholder for %s", (value) => {
    expect(formatMarketCap(value)).toBe(PLACEHOLDER);
  });
});

describe("formatRatio", () => {
  it("keeps one decimal", () => {
    expect(formatRatio(28.437)).toBe("28.4");
    expect(formatRatio(28.45)).toBe("28.5");
    expect(formatRatio(0)).toBe("0.0");
  });

  it("uses a true minus for negative ratios, but not for a rounded zero", () => {
    expect(formatRatio(-12.34)).toBe(`${MINUS}12.3`);
    expect(formatRatio(-0.04)).toBe("0.0");
  });

  it.each(invalid)("returns the placeholder for %s", (value) => {
    expect(formatRatio(value)).toBe(PLACEHOLDER);
  });
});
