"use server";

import { headers } from "next/headers";
import { isAPIError } from "better-auth/api";
import { auth } from "../better-auth/auth";
import { inngest } from "../inngest/client";

type AuthResult = { success: true } | { success: false; error: string };

const GENERIC_ERROR = "Something went wrong. Please try again.";

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
    default:
      return GENERIC_ERROR;
  }
};

export const signUpWithEmail = async ({
  email,
  password,
  fullName,
  country,
  investmentGoals,
  riskTolerance,
  preferredIndustry,
}: SignUpFormData): Promise<AuthResult> => {
  try {
    await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    });
  } catch (e) {
    console.error("Sign up failed", e);
    return { success: false, error: toAuthError(e) };
  }

  // The account exists at this point: a failure to queue the welcome email
  // must not be reported to the user as a failed sign-up.
  try {
    await inngest.send({
      name: "app/user.created",
      data: {
        email,
        name: fullName,
        country,
        investmentGoals,
        riskTolerance,
        preferredIndustry,
      },
    });
  } catch (e) {
    console.error("Failed to send app/user.created event", e);
  }

  return { success: true };
};

export const signInWithEmail = async ({
  email,
  password,
}: SignInFormData): Promise<AuthResult> => {
  try {
    await auth.api.signInEmail({
      body: { email, password },
    });
    return { success: true };
  } catch (e) {
    console.error("Sign in failed", e);
    return { success: false, error: toAuthError(e) };
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
