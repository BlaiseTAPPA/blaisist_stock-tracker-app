import { describe, expect, it } from "vitest";
import { preferencesSchema, resetPasswordSchema, signUpSchema } from "@/lib/validation/signup";
import { searchQuerySchema } from "@/lib/validation/search";

const valid = {
  fullName: "  Ada Lovelace  ",
  email: "ada@example.com",
  password: "correct horse",
  country: "FR",
  investmentGoals: "Growth",
  riskTolerance: "Medium",
  preferredIndustry: "Technology",
};

const firstError = (input: unknown) => {
  const result = signUpSchema.safeParse(input);
  return result.success ? null : result.error.issues[0]?.message;
};

describe("signUpSchema", () => {
  it("accepts a complete form and trims the name", () => {
    const result = signUpSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data?.fullName).toBe("Ada Lovelace");
  });

  it.each([
    ["a one-letter name", { fullName: " A " }, "Full name is required."],
    ["a 101-character name", { fullName: "a".repeat(101) }, "Full name is too long."],
    ["a malformed email", { email: "ada@" }, "Invalid email address."],
    ["a 7-character password", { password: "1234567" }, "Password must be at least 8 characters."],
    ["a 129-character password", { password: "a".repeat(129) }, "Password is too long."],
    ["an unknown country", { country: "XX" }, "Select a valid country."],
    ["an unknown goal", { investmentGoals: "Yolo" }, "Select a valid investment goal."],
    ["an unknown risk level", { riskTolerance: "Extreme" }, "Select a valid risk tolerance."],
    ["an unknown industry", { preferredIndustry: "<script>" }, "Select a valid industry."],
  ])("rejects %s", (_label, override, message) => {
    expect(firstError({ ...valid, ...override })).toBe(message);
  });

  it("accepts the password length bounds", () => {
    expect(signUpSchema.safeParse({ ...valid, password: "a".repeat(8) }).success).toBe(true);
    expect(signUpSchema.safeParse({ ...valid, password: "a".repeat(128) }).success).toBe(true);
  });

  it("rejects a missing required field", () => {
    const withoutEmail: Partial<typeof valid> = { ...valid };
    delete withoutEmail.email;
    expect(signUpSchema.safeParse(withoutEmail).success).toBe(false);
  });

  it("accepts name, email and password only (FLOW-09)", () => {
    const result = signUpSchema.safeParse({
      fullName: "Ada",
      email: "ada@example.com",
      password: "correct horse",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      fullName: "Ada",
      email: "ada@example.com",
      password: "correct horse",
      country: undefined,
      investmentGoals: undefined,
      riskTolerance: undefined,
      preferredIndustry: undefined,
    });
  });

  it("turns unselected preferences (empty strings) into undefined", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      country: "",
      investmentGoals: "",
      riskTolerance: "",
      preferredIndustry: "",
    });
    expect(result.success).toBe(true);
    expect(result.data?.country).toBeUndefined();
    expect(result.data?.preferredIndustry).toBeUndefined();
  });
});

describe("preferencesSchema", () => {
  it("accepts a partial update", () => {
    expect(preferencesSchema.parse({ riskTolerance: "High" })).toEqual({
      country: undefined,
      investmentGoals: undefined,
      riskTolerance: "High",
      preferredIndustry: undefined,
    });
  });

  it("rejects a value that is not one of the options", () => {
    expect(preferencesSchema.safeParse({ preferredIndustry: "Crypto" }).success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  const reset = { token: "tok", password: "new password", confirmPassword: "new password" };

  it("accepts matching passwords", () => {
    expect(resetPasswordSchema.safeParse(reset).success).toBe(true);
  });

  it.each([
    ["different passwords", { confirmPassword: "other password" }, "The passwords don't match."],
    [
      "a short password",
      { password: "short", confirmPassword: "short" },
      "Password must be at least 8 characters.",
    ],
    ["no token", { token: "" }, "This reset link is invalid."],
  ])("rejects %s", (_label, override, message) => {
    const result = resetPasswordSchema.safeParse({ ...reset, ...override });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe(message);
  });
});

describe("searchQuerySchema", () => {
  it.each(["AAPL", "brk.b", "AT&T", "Coca-Cola", "Société Générale", "  apple  "])(
    "accepts %s",
    (query) => {
      expect(searchQuerySchema.safeParse(query).success).toBe(true);
    },
  );

  it("trims the query", () => {
    expect(searchQuerySchema.parse("  apple  ")).toBe("apple");
  });

  it.each([
    ["an empty query", ""],
    ["only spaces", "   "],
    ["33 characters", "a".repeat(33)],
    ["markup", "<script>"],
    ["a URL", "https://x.test"],
    ["a query-string injection", "AAPL&token=x"],
  ])("rejects %s", (_label, query) => {
    // "&" alone is allowed (AT&T); "=" and ":" are not.
    expect(searchQuerySchema.safeParse(query).success).toBe(false);
  });

  it("accepts exactly 32 characters", () => {
    expect(searchQuerySchema.safeParse("a".repeat(32)).success).toBe(true);
  });
});
