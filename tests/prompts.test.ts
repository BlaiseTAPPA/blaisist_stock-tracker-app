import { describe, expect, it } from "vitest";
import { formatUserProfile, PERSONALIZED_WELCOME_EMAIL_PROMPT } from "@/lib/inngest/prompts";

// Preferences are optional at sign-up (FLOW-09): the welcome prompt must not
// receive empty fields the model could fill in.

describe("formatUserProfile", () => {
  it("lists every given field", () => {
    expect(
      formatUserProfile({
        country: "FR",
        investmentGoals: "Growth",
        riskTolerance: "Medium",
        preferredIndustry: "Technology",
      }),
    ).toBe(
      "- Country: FR\n- Investment goals: Growth\n- Risk tolerance: Medium\n- Preferred industry: Technology",
    );
  });

  it("leaves out missing and blank fields", () => {
    expect(formatUserProfile({ country: "", investmentGoals: "Income", riskTolerance: "  " })).toBe(
      "- Investment goals: Income",
    );
  });

  it("says so when nothing was given", () => {
    expect(formatUserProfile({})).toBe("- No preferences given.");
    expect(
      formatUserProfile({
        country: "",
        investmentGoals: "",
        riskTolerance: "",
        preferredIndustry: "",
      }),
    ).toBe("- No preferences given.");
  });

  it("is what the welcome prompt asks the model to rely on", () => {
    expect(PERSONALIZED_WELCOME_EMAIL_PROMPT).toContain("{{userProfile}}");
    expect(PERSONALIZED_WELCOME_EMAIL_PROMPT).toMatch(/not listed was not given/);
  });
});
