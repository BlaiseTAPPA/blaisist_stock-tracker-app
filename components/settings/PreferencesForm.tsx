"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { PreferencesFormData } from "@/types/forms";
import FormError from "@/components/forms/FormError";
import PreferenceFields from "@/components/forms/PreferenceFields";
import { Button } from "@/components/ui/button";
import { updatePreferences } from "@/lib/actions/settings.actions";

const PreferencesForm = ({ defaults }: { defaults: PreferencesFormData }) => {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PreferencesFormData>({ defaultValues: defaults });

  const onSubmit = async (data: PreferencesFormData) => {
    setFormError(null);
    try {
      const result = await updatePreferences(data);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      reset(data);
      toast.success("Preferences saved");
    } catch (e) {
      console.error(e);
      setFormError("Couldn't save your preferences. Check your connection, then try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <PreferenceFields control={control} errors={errors} />
      <FormError message={formError} />
      <Button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary px-6">
        {isSubmitting ? "Saving…" : "Save preferences"}
      </Button>
    </form>
  );
};

export default PreferencesForm;
