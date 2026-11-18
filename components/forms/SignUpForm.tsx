"use client";

import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import PreferenceFields from "@/components/forms/PreferenceFields";
import VerifyEmailNotice from "@/components/forms/VerifyEmailNotice";
import FormError from "@/components/forms/FormError";
import { Button } from "@/components/ui/button";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SignUpFormData } from "@/types/forms";

const SignUpForm = () => {
  // Set once the account is created: the user must verify their email
  // before they can sign in.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      // Optional and never chosen in advance: a pre-selected value would be
      // stored as if the user had picked it.
      country: "",
      investmentGoals: "",
      riskTolerance: "",
      preferredIndustry: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignUpFormData) => {
    setFormError(null);
    try {
      const result = await signUpWithEmail(data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setPendingEmail(data.email);
    } catch (e) {
      // Network failure or a server action that threw: no detail to show.
      console.error(e);
      setFormError("Couldn't create your account. Check your connection, then try again.");
    }
  };

  if (pendingEmail) {
    return (
      <>
        <h1 className="form-title">Check your inbox</h1>
        <VerifyEmailNotice
          email={pendingEmail}
          title={`We sent a verification link to ${pendingEmail}`}
          description="Click the link in the email to activate your account and sign in. It expires in 1 hour; also check your spam folder."
        />
        <FooterLink text="Already verified?" linkText="Sign in" href="/sign-in" />
      </>
    );
  }

  return (
    <>
      <h1 className="form-title">Create your account</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="fullName"
          label="Full name"
          autoComplete="name"
          placeholder="Your name"
          register={register}
          error={errors.fullName}
          validation={{
            required: "Full name is required",
            minLength: { value: 2, message: "Full name must be at least 2 characters" },
          }}
        />
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

        {/* Native disclosure: keyboard and screen reader support for free. */}
        <details className="group rounded-lg border border-surface-hover">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium text-fg focus-ring [&::-webkit-details-marker]:hidden">
            <span>
              Personalize your welcome email{" "}
              <span className="font-normal text-fg-muted">(optional)</span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 shrink-0 text-fg-muted transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="space-y-5 px-4 pt-1 pb-4">
            <p className="text-xs text-fg-muted">
              Skip this if you like: you can add or change it later in Settings.
            </p>
            <PreferenceFields
              control={control}
              errors={errors}
              countryHint="Used to personalize your welcome email."
            />
          </div>
        </details>

        <FormError message={formError} />
        <Button type="submit" disabled={isSubmitting} className="btn-primary mt-5 w-full">
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
        <FooterLink text="Already have an account?" linkText="Sign in" href="/sign-in" />
      </form>
    </>
  );
};

export default SignUpForm;
