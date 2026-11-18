import { z } from "zod";
import countryList from "react-select-country-list";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";

// Shared by the sign-up and settings server actions and the Better Auth user
// fields, so the profile that reaches the AI prompts is always one of the
// form's options.

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

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Full name is required.")
  .max(100, "Full name is too long.");

// Same bounds as `emailAndPassword` in lib/better-auth/auth.ts.
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.");

/**
 * An optional preference: the forms send "" for "not chosen", which becomes
 * `undefined` so nothing is stored. Any other value must be a valid option.
 */
const optionalPreference = (schema: z.ZodType<string>) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

export const preferencesSchema = z.object({
  country: optionalPreference(countrySchema),
  investmentGoals: optionalPreference(investmentGoalsSchema),
  riskTolerance: optionalPreference(riskToleranceSchema),
  preferredIndustry: optionalPreference(preferredIndustrySchema),
});

/** Name, email and password are required; the preferences are optional. */
export const signUpSchema = z
  .object({
    fullName: fullNameSchema,
    email: z.email("Invalid email address."),
    password: passwordSchema,
  })
  .extend(preferencesSchema.shape);

export type SignUpInput = z.infer<typeof signUpSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;

export const profileSchema = z.object({ fullName: fullNameSchema });

export const forgotPasswordSchema = z.object({ email: z.email("Invalid email address.") });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "This reset link is invalid."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The passwords don't match.",
    path: ["confirmPassword"],
  });
