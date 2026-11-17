"use client";

import type { SignInFormData } from "@/types/forms";
import FooterLink from "@/components/forms/FooterLink";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import VerifyEmailNotice from "@/components/forms/VerifyEmailNotice";
import { signInWithEmail } from "@/lib/actions/auth.actions";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// Codes Better Auth appends as `?error=` when a verification link fails.
const VERIFY_LINK_ERRORS: Record<string, string> = {
  TOKEN_EXPIRED: "This verification link has expired. Sign in to get a new one.",
  INVALID_TOKEN: "This verification link is invalid. Sign in to get a new one.",
};

const VerifyLinkError = () => {
  const code = useSearchParams().get("error");
  if (!code) return null;

  return (
    <p role="alert" className="mb-5 text-sm text-red-500">
      {VERIFY_LINK_ERRORS[code] ?? "We could not verify your email. Please try again."}
    </p>
  );
};

const SignIn = () => {
  const router = useRouter();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
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
    try {
      setUnverifiedEmail(null);
      const result = await signInWithEmail(data);
      if (!result.success) {
        if (result.reason === "EMAIL_NOT_VERIFIED") {
          setUnverifiedEmail(data.email);
          return;
        }
        toast.error(result.error);
        return;
      }
      router.push("/");
    } catch (e) {
      console.error(e);
      toast.error("Sign in failed", {
        description: e instanceof Error ? e.message : "Failed to sign in",
      });
    }
  };

  return (
    <>
      <h1 className="form-title">Log in to your account</h1>
      <Suspense fallback={null}>
        <VerifyLinkError />
      </Suspense>
      {unverifiedEmail && (
        <div className="mb-5">
          <VerifyEmailNotice
            email={unverifiedEmail}
            title="Please verify your email address"
            description="Check your inbox to activate your account. The link may take a minute to arrive; also check your spam folder."
          />
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <InputField
          name="email"
          label="Email"
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

        <Button type="submit" disabled={isSubmitting} className="yellow-btn mt-5 w-full">
          {isSubmitting ? "Signing in…" : "Log In"}
        </Button>
        <FooterLink text="Don't have an account?" linkText="Create an account" href="/sign-up" />
      </form>
    </>
  );
};

export default SignIn;
