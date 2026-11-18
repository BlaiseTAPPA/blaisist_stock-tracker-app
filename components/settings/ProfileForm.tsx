"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ProfileFormData } from "@/types/forms";
import FormError from "@/components/forms/FormError";
import InputField from "@/components/forms/InputField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/settings.actions";

const ProfileForm = ({ name, email }: { name: string; email: string }) => {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({ defaultValues: { fullName: name }, mode: "onBlur" });

  const onSubmit = async (data: ProfileFormData) => {
    setFormError(null);
    try {
      const result = await updateProfile(data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      reset({ fullName: data.fullName.trim() });
      toast.success("Name saved");
      // The header shows the name: re-render the layout with the new one.
      router.refresh();
    } catch (e) {
      console.error(e);
      setFormError("Couldn't save your name. Check your connection, then try again.");
    }
  };

  return (
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
          maxLength: { value: 100, message: "Full name is too long" },
        }}
      />
      <div className="space-y-2">
        <Label htmlFor="account-email" className="form-label">
          Email
        </Label>
        <Input
          id="account-email"
          type="email"
          value={email}
          readOnly
          aria-describedby="account-email-hint"
          className="form-input cursor-default text-fg-secondary"
        />
        <p id="account-email-hint" className="text-xs text-fg-muted">
          Your sign-in address. It can&apos;t be changed here.
        </p>
      </div>
      <FormError message={formError} />
      <Button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary px-6">
        {isSubmitting ? "Saving…" : "Save name"}
      </Button>
    </form>
  );
};

export default ProfileForm;
