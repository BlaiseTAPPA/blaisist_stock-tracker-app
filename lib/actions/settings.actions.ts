"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/better-auth/auth";
import { getSessionUser } from "@/lib/auth/session";
import { createThrottle } from "@/lib/security/throttle";
import { preferencesSchema, profileSchema } from "@/lib/validation/signup";
import type { PreferencesFormData, ProfileFormData } from "@/types/forms";

// Every export of a "use server" file is a public POST endpoint. Each action
// validates its input, and Better Auth's `updateUser` takes the user from the
// session cookie: no user id ever comes from the client.

export type SettingsResult = { success: true } | { success: false; error: string };

const GENERIC_ERROR = "Couldn't save your changes. Try again in a moment.";
const SIGNED_OUT_ERROR = "Your session has expired. Sign in again.";

// Generous for a person, tight for a script hammering the database.
const isThrottled = createThrottle({ windowMs: 60_000, max: 20 });

const updateUser = async (body: Record<string, unknown>): Promise<SettingsResult> => {
  const user = await getSessionUser();
  if (!user) return { success: false, error: SIGNED_OUT_ERROR };
  if (isThrottled(user.id)) {
    return { success: false, error: "Too many changes. Wait a minute, then try again." };
  }

  try {
    await auth.api.updateUser({ headers: await headers(), body });
    // The header shows the name; the settings page reads every field.
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e) {
    console.error("Settings update failed", e);
    return { success: false, error: GENERIC_ERROR };
  }
};

const firstIssue = (error: z.ZodError) =>
  error.issues[0]?.message ?? "Check the form, then try again.";

export const updateProfile = async (data: ProfileFormData): Promise<SettingsResult> => {
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };
  return updateUser({ name: parsed.data.fullName });
};

export const updatePreferences = async (data: PreferencesFormData): Promise<SettingsResult> => {
  const parsed = preferencesSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };

  // Only the chosen values: an empty select leaves the stored value as is.
  const body = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined),
  );
  if (Object.keys(body).length === 0) return { success: true };
  return updateUser(body);
};

export const setDigestEnabled = async (enabled: boolean): Promise<SettingsResult> => {
  const parsed = z.boolean().safeParse(enabled);
  if (!parsed.success) return { success: false, error: GENERIC_ERROR };
  return updateUser({ digestEnabled: parsed.data });
};
