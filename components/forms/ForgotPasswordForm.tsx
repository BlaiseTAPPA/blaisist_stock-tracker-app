"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { ForgotPasswordFormData } from "@/types/forms";
import FooterLink from "@/components/forms/FooterLink";
import FormError from "@/components/forms/FormError";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/lib/actions/auth.actions";

const ForgotPasswordForm = () => {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({ defaultValues: { email: "" }, mode: "onBlur" });

  const onSubmit = async ({ email }: ForgotPasswordFormData) => {
    setFormError(null);
    try {
      const result = await requestPasswordReset(email);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setSentTo(email);
    } catch (e) {
      console.error(e);
      setFormError("Couldn't send the email. Check your connection, then try again.");
    }
  };

  if (sentTo) {
    // Same message whether or not the address has an account.
    return (
      <>
        <h1 className="form-title">Check your inbox</h1>
        <div
          role="status"
          className="space-y-3 rounded-lg border border-border bg-surface-raised p-4"
        >
          <p className="font-semibold text-fg">
            If an account exists for {sentTo}, we sent it a link to reset the password.
          </p>
          <p className="text-sm text-fg-secondary">
            The link expires in 1 hour and works once. It may take a minute to arrive; also check
            your spam folder.
          </p>
        </div>
        <FooterLink text="Remembered it?" linkText="Sign in" href="/sign-in" />
      </>
    );
  }

  return (
    <>
      <h1 className="form-title">Reset your password</h1>
      <p className="-mt-6 mb-8 text-sm text-fg-secondary">
        Enter the email address of your account and we&apos;ll send you a link to choose a new
        password.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
          }}
        />
        <FormError message={formError} />
        <Button type="submit" disabled={isSubmitting} className="btn-primary mt-5 w-full">
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
        <FooterLink text="Remembered it?" linkText="Sign in" href="/sign-in" />
      </form>
    </>
  );
};

export default ForgotPasswordForm;
