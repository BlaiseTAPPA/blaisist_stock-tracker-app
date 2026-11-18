import { Controller, type FieldValues } from "react-hook-form";
import type { SelectFieldProps } from "@/types/forms";
import { fieldA11y } from "@/components/forms/field-a11y";
import { Label } from "../ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SelectField = <TFieldValues extends FieldValues>({
  name,
  label,
  placeholder,
  options,
  control,
  error,
  required = false,
}: SelectFieldProps<TFieldValues>) => {
  const { errorId, controlProps } = fieldA11y(name, { error, required });

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>

      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `Select your ${label.toLowerCase()}` : false,
        }}
        render={({ field }) => (
          <Select name={field.name} value={field.value} onValueChange={field.onChange}>
            {/* The trigger is the focusable combobox: it carries the id the label points to.
                No `onBlur`: opening the list moves focus out of the trigger. */}
            <SelectTrigger id={name} ref={field.ref} className="select-trigger" {...controlProps}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="border-border bg-surface-raised text-fg">
              {options.map((option) => (
                <SelectItem
                  value={option.value}
                  key={option.value}
                  className="focus:bg-border focus:text-fg"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {/* Outside the Radix <Select> (which only expects trigger/content children), under the trigger. */}
      {error && (
        <p id={errorId} role="alert" className="text-sm text-danger">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default SelectField;
