"use client";

import { CountrySelectField } from "@/components/forms/CountrySelectField";
import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import SelectField from "@/components/forms/SelectField";
import VerifyEmailNotice from "@/components/forms/VerifyEmailNotice";
import { Button } from "@/components/ui/button";
import { signUpWithEmail } from "@/lib/actions/auth.actions";
import { INVESTMENT_GOALS, RISK_TOLERANCE_OPTIONS, PREFERRED_INDUSTRIES } from "@/lib/constants";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { SignUpFormData } from "@/types/forms";
import { toast } from "sonner";

const SignUpForm = () => {
  // Set once the account is created: the user must verify their email
  // before they can sign in.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
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
      // No pre-selected country: a hard-coded one was wrong for most users.
      country: "",
      investmentGoals: "Growth",
      riskTolerance: "Medium",
      preferredIndustry: "Technology",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const result = await signUpWithEmail(data);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setPendingEmail(data.email);
    } catch (e) {
      console.error(e);
      toast.error("Sign up failed", {
        description: e instanceof Error ? e.message : "Failed to create an account",
      });
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
      <h1 className="form-title">Sign Up and Personalize</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="fullName"
          label="Full name"
          autoComplete="name"
          placeholder="John Doe"
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
          placeholder="donniedarko@example.com"
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

        <CountrySelectField
          name="country"
          label="Country"
          control={control}
          error={errors.country}
          required
        />

        <SelectField
          name="investmentGoals"
          label="Investment goals"
          placeholder="Select your investment goal"
          options={INVESTMENT_GOALS}
          control={control}
          error={errors.investmentGoals}
          required
        />
        <SelectField
          name="riskTolerance"
          label="Risk tolerance"
          placeholder="Select your risk level"
          options={RISK_TOLERANCE_OPTIONS}
          control={control}
          error={errors.riskTolerance}
          required
        />
        <SelectField
          name="preferredIndustry"
          label="Preferred industry"
          placeholder="Select your preferred industry"
          options={PREFERRED_INDUSTRIES}
          control={control}
          error={errors.preferredIndustry}
          required
        />

        <Button type="submit" disabled={isSubmitting} className="yellow-btn mt-5 w-full">
          {isSubmitting ? "Creating account…" : "Start your investing journey"}
        </Button>
        <FooterLink text="Already have an account?" linkText="Sign in" href="/sign-in" />
      </form>
    </>
  );
};

export default SignUpForm;
