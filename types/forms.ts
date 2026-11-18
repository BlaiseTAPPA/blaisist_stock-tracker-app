import type {
  Control,
  FieldError,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
} from "react-hook-form";

export type SignInFormData = {
  email: string;
  password: string;
};

/** Optional preferences: "" means "not chosen". */
export type PreferencesFormData = {
  country: string;
  investmentGoals: string;
  riskTolerance: string;
  preferredIndustry: string;
};

export type SignUpFormData = PreferencesFormData & {
  fullName: string;
  email: string;
  password: string;
};

export type ForgotPasswordFormData = {
  email: string;
};

export type ResetPasswordFormData = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ProfileFormData = {
  fullName: string;
};

export type Option = {
  value: string;
  label: string;
};

export type InputFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  type?: string;
  /** HTML `autocomplete` token, e.g. "email", "current-password". */
  autoComplete?: string;
  register: UseFormRegister<TFieldValues>;
  error?: FieldError;
  validation?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  disabled?: boolean;
  value?: string;
};

export type SelectFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  label: string;
  placeholder: string;
  options: readonly Option[];
  control: Control<TFieldValues>;
  error?: FieldError;
  required?: boolean;
};

export type CountrySelectFieldProps<TFieldValues extends FieldValues> = {
  name: Path<TFieldValues>;
  label: string;
  control: Control<TFieldValues>;
  error?: FieldError;
  required?: boolean;
  /** Help text under the field; none when omitted. */
  hint?: string;
};

export type FooterLinkProps = {
  text: string;
  linkText: string;
  href: string;
};
