"use client";

import type { Control, FieldError, FieldValues, Path } from "react-hook-form";
import type { PreferencesFormData } from "@/types/forms";
import { CountrySelectField } from "@/components/forms/CountrySelectField";
import SelectField from "@/components/forms/SelectField";
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from "@/lib/constants";

type PreferenceKey = keyof PreferencesFormData;

type PreferenceFieldsProps<T extends FieldValues & PreferencesFormData> = {
  control: Control<T>;
  errors: Partial<Record<PreferenceKey, FieldError>>;
  countryHint?: string;
};

/**
 * Country, goal, risk and industry: optional everywhere, with no value chosen
 * in advance. Shared by the sign-up form and /settings.
 */
const PreferenceFields = <T extends FieldValues & PreferencesFormData>({
  control,
  errors,
  countryHint,
}: PreferenceFieldsProps<T>) => {
  // T extends PreferencesFormData, so each key is a path of T; TypeScript
  // can't prove it for a generic T.
  const path = (key: PreferenceKey) => key as Path<T>;

  return (
    <>
      <CountrySelectField
        name={path("country")}
        label="Country"
        control={control}
        error={errors.country}
        hint={countryHint}
      />
      <SelectField
        name={path("investmentGoals")}
        label="Investment goals"
        placeholder="Select your investment goal"
        options={INVESTMENT_GOALS}
        control={control}
        error={errors.investmentGoals}
      />
      <SelectField
        name={path("riskTolerance")}
        label="Risk tolerance"
        placeholder="Select your risk level"
        options={RISK_TOLERANCE_OPTIONS}
        control={control}
        error={errors.riskTolerance}
      />
      <SelectField
        name={path("preferredIndustry")}
        label="Preferred industry"
        placeholder="Select your preferred industry"
        options={PREFERRED_INDUSTRIES}
        control={control}
        error={errors.preferredIndustry}
      />
    </>
  );
};

export default PreferenceFields;
