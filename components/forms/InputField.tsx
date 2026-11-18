"use client";

import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import type { InputFieldProps } from "@/types/forms";
import { cn } from "@/lib/utils";
import { fieldA11y } from "@/components/forms/field-a11y";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const InputField = <TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  autoComplete,
  register,
  error,
  validation,
  disabled,
  value,
}: InputFieldProps<TFieldValues>) => {
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);
  const { errorId, controlProps } = fieldA11y(name, { error, required: !!validation?.required });

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>
      <div className="relative">
        <Input
          type={isPassword && showPassword ? "text" : type}
          id={name}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          value={value}
          className={cn("form-input", {
            "pr-12": isPassword,
            "cursor-not-allowed opacity-50": disabled,
          })}
          {...controlProps}
          {...register(name, validation)}
        />
        {isPassword && (
          // The label stays the same and `aria-pressed` carries the state, so
          // a screen reader announces "Show password, toggle button, pressed".
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label="Show password"
            aria-pressed={showPassword}
            aria-controls={name}
            disabled={disabled}
            className="focus-ring absolute top-1/2 right-1 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-gray-500 transition-colors hover:text-gray-300"
          >
            {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default InputField;
