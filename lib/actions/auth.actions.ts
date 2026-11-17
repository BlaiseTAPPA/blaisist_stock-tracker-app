"use server";

import { headers } from "next/headers";
import { isAPIError } from "better-auth/api";
import { auth, VERIFY_EMAIL_CALLBACK_URL } from "../better-auth/auth";
import { checkAuthRateLimit } from "../auth/rate-limit";
import { signUpSchema } from "../validation/signup";

type AuthResult =
  | { success: true }
  | { success: false; error: string; reason?: "EMAIL_NOT_VERIFIED" };

const GENERIC_ERROR = "Something went wrong. Please try again.";
const INVALID_FORM_ERROR = "Please check the form and try again.";
const EMAIL_NOT_VERIFIED_ERROR =
  "Please verify your email address: check your inbox to activate your account.";

// Maps Better Auth errors to messages that are safe to show in the UI.
// Anything unexpected gets the generic message; the details stay in the logs.
const toAuthError = (e: unknown): string => {
  if (!isAPIError(e)) return GENERIC_ERROR;

  switch (e.body?.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Incorrect email or password.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists.";
    case "EMAIL_NOT_VERIFIED":
      return EMAIL_NOT_VERIFIED_ERROR;
    default:
      return GENERIC_ERROR;
  }
};

export const signUpWithEmail = async (
  data: SignUpFormData,
): Promise<AuthResult> => {
  // Server actions are public endpoints: never trust the client's values.
  const parsed = signUpSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? INVALID_FORM_ERROR,
    };
  }
  const {
    email,
    password,
    fullName,
    country,
    investmentGoals,
    riskTolerance,
    preferredIndustry,
  } = parsed.data;

  const limited = await checkAuthRateLimit("sign-up", email);
  if (limited) return { success: false, error: limited };

  try {
    // No session is created: Better Auth sends the verification email, and
    // the welcome email is queued once the address is verified (see
    // `emailVerification.afterEmailVerification` in lib/better-auth/auth.ts).
    // With verification required, an already registered email gets the same
    // response, so sign-up does not reveal which addresses have an account.
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: fullName,
        country,
        investmentGoals,
        riskTolerance,
        preferredIndustry,
        callbackURL: VERIFY_EMAIL_CALLBACK_URL,
      },
    });
    return { success: true };
  } catch (e) {
    console.error("Sign up failed", e);
    return { success: false, error: toAuthError(e) };
  }
};

export const signInWithEmail = async ({
  email,
  password,
}: SignInFormData): Promise<AuthResult> => {
  const limited = await checkAuthRateLimit("sign-in", email);
  if (limited) return { success: false, error: limited };

  try {
    await auth.api.signInEmail({
      body: { email, password, callbackURL: VERIFY_EMAIL_CALLBACK_URL },
    });
    return { success: true };
  } catch (e) {
    // Better Auth only reports EMAIL_NOT_VERIFIED after checking the
    // password, so this does not leak which addresses are registered.
    if (isAPIError(e) && e.body?.code === "EMAIL_NOT_VERIFIED") {
      return {
        success: false,
        error: EMAIL_NOT_VERIFIED_ERROR,
        reason: "EMAIL_NOT_VERIFIED",
      };
    }
    console.error("Sign in failed", e);
    return { success: false, error: toAuthError(e) };
  }
};

/**
 * Sends a new verification link. Always reports success for a well-formed
 * request, whether or not the address has an unverified account, so it cannot
 * be used to probe which emails are registered.
 */
export const resendVerificationEmail = async (
  email: string,
): Promise<AuthResult> => {
  const limited = await checkAuthRateLimit("resend-verification", email);
  if (limited) return { success: false, error: limited };

  try {
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: VERIFY_EMAIL_CALLBACK_URL },
    });
    return { success: true };
  } catch (e) {
    console.error("Resend verification email failed", e);
    return { success: false, error: GENERIC_ERROR };
  }
};

export const signOut = async (): Promise<AuthResult> => {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { success: true };
  } catch (e) {
    console.error("Sign out failed", e);
    return { success: false, error: GENERIC_ERROR };
  }
};
