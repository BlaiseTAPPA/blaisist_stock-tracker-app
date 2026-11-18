import type { Metadata } from "next";
import ResetPasswordForm, { InvalidResetLink } from "@/components/forms/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new password",
  // The URL carries a one-time token.
  robots: { index: false },
  referrer: "no-referrer",
};

// Better Auth checks the emailed link, then redirects here with `?token=…`
// when it is valid or `?error=INVALID_TOKEN` when it is not.
export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const { token, error } = await searchParams;

  if (error || typeof token !== "string" || !token) return <InvalidResetLink />;
  return <ResetPasswordForm token={token} />;
}
