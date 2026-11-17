import type { FieldValues } from "react-hook-form";
import type { InputFieldProps } from "@/types/forms";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const InputField = <TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  type = "text",
  register,
  error,
  validation,
  disabled,
  value,
}: InputFieldProps<TFieldValues>) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>
      <Input
        type={type}
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        className={cn("form-input", { "cursor-not-allowed opacity-50": disabled })}
        {...register(name, validation)}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
};

export default InputField;
