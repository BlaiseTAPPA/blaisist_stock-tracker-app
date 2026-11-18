"use client";

import type { SignInFormData } from "@/types/forms";
import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import VerifyEmailNotice from "@/components/forms/VerifyEmailNotice";
import FormError from "@/components/forms/FormError";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";

// Codes Better Auth appends as `?error=` when a verification link fails.
const VERIFY_LINK_ERRORS: Record<string, string> = {
  TOKEN_EXPIRED: "This verification link has expired. Sign in to get a new one.",
  INVALID_TOKEN: "This verification link is invalid. Sign in to get a new one.",
};

/** Outcome of a link that lands here: a failed verification or a password reset. */
const LinkNotice = () => {
  const params = useSearchParams();
  const code = params.get("error");

  if (code) {
    return (
      <p role="alert" className="mb-5 text-sm text-red-500">
        {VERIFY_LINK_ERRORS[code] ?? "Your email couldn't be verified. Sign in to get a new link."}
      </p>
    );
  }
  if (params.get("reset") === "success") {
    return (
      <p
        role="status"
        className="mb-5 rounded-lg border border-gray-600 bg-gray-800 p-4 text-sm text-gray-100"
      >
        Your password has been changed and you were signed out everywhere. Sign in with your new
        password.
      </p>
    );
  }
  return null;
};

const SignInForm = () => {
  const router = useRouter();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignInFormData) => {
    setUnverifiedEmail(null);
    setFormError(null);
    try {
      const result = await signInWithEmail(data);
      if (!result.success) {
        if (result.reason === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(data.email);
          return;
        }
        setFormError(result.error);
        return;
      }
      router.push("/");
    } catch (e) {
      // Network failure or a server action that threw: no detail to show.
      console.error(e);
      setFormError("Sign in failed. Check your connection, then try again.");
    }
  };

  return (
    <>
      <h1 className="form-title">Sign in to FinGenius</h1>
      <Suspense fallback={null}>
        <LinkNotice />
      </Suspense>
      {unverifiedEmail && (
        <div className="mb-5">
          <VerifyEmailNotice
            email={unverifiedEmail}
            title="Verify your email address"
            description="Check your inbox to activate your account. The link may take a minute to arrive; also check your spam folder."
          />
        </div>
      )}
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
        <InputField
          name="password"
          label="Password"
          placeholder="Enter your password"
          type="password"
          autoComplete="current-password"
          register={register}
          error={errors.password}
          validation={{
            // Only required: the length rule belongs to sign-up, and quoting
            // it here would mislead a user who just mistyped.
            required: "Enter your password",
          }}
        />
        <p className="-mt-2 text-right text-sm">
          <Link
            href="/forgot-password"
            className="inline-flex min-h-11 items-center rounded-sm text-gray-400 underline-offset-4 focus-ring hover:text-yellow-500 hover:underline"
          >
            Forgot password?
          </Link>
        </p>

        <FormError message={formError} />
        <Button type="submit" disabled={isSubmitting} className="yellow-btn mt-5 w-full">
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
        <FooterLink text="Don't have an account?" linkText="Create account" href="/sign-up" />
      </form>
    </>
  );
};

export default SignInForm;
