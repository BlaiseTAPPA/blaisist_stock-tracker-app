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

const SignUp = () => {
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
      country: "DE",
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
          label="Full Name"
          placeholder="John Doe"
          register={register}
          error={errors.fullName}
          validation={{ required: "Full name is required", minLength: 2 }}
        />
        <InputField
          name="email"
          label="Email"
          type="email"
          placeholder="donniedarko@example.com"
          register={register}
          error={errors.email}
          validation={{
            required: "Email is required",
            minLength: 2,
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" },
          }}
        />
        <InputField
          name="password"
          label="Password"
          placeholder="Enter a strong password"
          type="password"
          register={register}
          error={errors.password}
          validation={{ required: "Password is required", minLength: 8 }}
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
          label="Investment Goals"
          placeholder="Select your investment goal"
          options={INVESTMENT_GOALS}
          control={control}
          error={errors.preferredIndustry}
          required
        />
        <SelectField
          name="riskTolerance"
          label="Risk Tolerance"
          placeholder="Select your risk level"
          options={RISK_TOLERANCE_OPTIONS}
          control={control}
          error={errors.riskTolerance}
          required
        />
        <SelectField
          name="preferredIndustry"
          label="Preferred Industry"
          placeholder="Select your preferred industry"
          options={PREFERRED_INDUSTRIES}
          control={control}
          error={errors.preferredIndustry}
          required
        />

        <Button type="submit" disabled={isSubmitting} className="yellow-btn mt-5 w-full">
          {isSubmitting ? "Creating account…" : "Start Your Investing Journey"}
        </Button>
        <FooterLink text="Already have an account?" linkText="Sign in" href="/sign-in" />
      </form>
    </>
  );
};

export default SignUp;
