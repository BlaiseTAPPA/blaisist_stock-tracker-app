/**
 * Form-level error returned by the server (wrong password, existing account,
 * rate limit). Rendered next to the submit button and kept until the next
 * submit: a toast vanishes after a few seconds and sits far from the form.
 * The node is re-created for each new error, so `role="alert"` announces it
 * again even when the text is the same.
 */
const FormError = ({ message }: { message: string | null }) =>
  message ? (
    <p role="alert" className="text-sm text-red-500">
      {message}
    </p>
  ) : null;

export default FormError;
