import type { FieldError } from "react-hook-form";

type FieldA11yOptions = {
  error?: FieldError;
  required?: boolean;
  /** Whether the field renders a help text with the `${name}-hint` id. */
  hasHint?: boolean;
};

/**
 * ARIA wiring shared by the form fields. The control's `id` is the field name
 * (so `<Label htmlFor={name}>` targets it); the error and the help text get
 * stable ids derived from it and are referenced by `aria-describedby`.
 */
export function fieldA11y(name: string, { error, required, hasHint }: FieldA11yOptions) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy = [error && errorId, hasHint && hintId].filter(Boolean).join(" ");

  return {
    errorId,
    hintId,
    controlProps: {
      "aria-invalid": error ? true : undefined,
      "aria-describedby": describedBy || undefined,
      "aria-required": required || undefined,
    },
  };
}
