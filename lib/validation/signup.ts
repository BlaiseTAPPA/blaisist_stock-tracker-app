import { z } from "zod";
import countryList from "react-select-country-list";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";

// Shared by the sign-up server action and the Better Auth user fields, so the
// profile that reaches the AI prompts is always one of the form's options.

type Option = { value: string };

const optionEnum = (options: readonly Option[], label: string) =>
  z.enum(options.map((option) => option.value) as [string, ...string[]], {
    error: `Select a valid ${label}.`,
  });

/** ISO 3166-1 alpha-2 codes, the same list as the country picker. */
const COUNTRY_CODES = countryList().getValues() as [string, ...string[]];

export const countrySchema = z.enum(COUNTRY_CODES, {
  error: "Select a valid country.",
});
export const investmentGoalsSchema = optionEnum(INVESTMENT_GOALS, "investment goal");
export const riskToleranceSchema = optionEnum(RISK_TOLERANCE_OPTIONS, "risk tolerance");
export const preferredIndustrySchema = optionEnum(PREFERRED_INDUSTRIES, "industry");

export const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required.").max(100, "Full name is too long."),
  email: z.email("Invalid email address."),
  // Same bounds as `emailAndPassword` in lib/better-auth/auth.ts.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128, "Password is too long."),
  country: countrySchema,
  investmentGoals: investmentGoalsSchema,
  riskTolerance: riskToleranceSchema,
  preferredIndustry: preferredIndustrySchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
