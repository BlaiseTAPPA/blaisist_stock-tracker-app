"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { ResetPasswordFormData } from "@/types/forms";
import FooterLink from "@/components/forms/FooterLink";
import FormError from "@/components/forms/FormError";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/actions/auth.actions";

/** Shown when the link has no token, or Better Auth redirected with `?error=…`. */
export const InvalidResetLink = () => (
  <>
    <h1 className="form-title">Reset link expired</h1>
    <p role="alert" className="mb-6 text-sm text-danger">
      This reset link is invalid or has expired. Links work once, for 1 hour.
    </p>
    <Link
      href="/forgot-password"
      className="btn-primary inline-flex w-full items-center justify-center"
    >
      Request a new link
    </Link>
    <FooterLink text="Remembered it?" linkText="Sign in" href="/sign-in" />
  </>
);

const ResetPasswordForm = ({ token }: { token: string }) => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    defaultValues: { token, password: "", confirmPassword: "" },
    // Re-checked as the user types once a field was left: a "don't match"
    // error left until blur would vanish on the mousedown of the submit
    // button, move it up, and swallow the click.
    mode: "onTouched",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setFormError(null);
    try {
      const result = await resetPassword({ ...data, token });
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      router.push("/sign-in?reset=success");
    } catch (e) {
      console.error(e);
      setFormError("Couldn't change your password. Check your connection, then try again.");
    }
  };

  return (
    <>
      <h1 className="form-title">Choose a new password</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="password"
          label="New password"
          placeholder="At least 8 characters"
          type="password"
          autoComplete="new-password"
          register={register}
          error={errors.password}
          validation={{
            required: "Password is required",
            minLength: { value: 8, message: "Password must be at least 8 characters" },
          }}
        />
        <InputField
          name="confirmPassword"
          label="Confirm new password"
          placeholder="Type it again"
          type="password"
          autoComplete="new-password"
          register={register}
          error={errors.confirmPassword}
          validation={{
            required: "Confirm your new password",
            validate: (value) => value === getValues("password") || "The passwords don't match",
          }}
        />
        <FormError message={formError} />
        <Button type="submit" disabled={isSubmitting} className="btn-primary mt-5 w-full">
          {isSubmitting ? "Saving…" : "Change password"}
        </Button>
        <p className="text-center text-sm text-fg-muted">
          You&apos;ll be signed out on every device.
        </p>
      </form>
    </>
  );
};

export default ResetPasswordForm;
