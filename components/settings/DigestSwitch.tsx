"use client";

import { useId, useState, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { setDigestEnabled } from "@/lib/actions/settings.actions";

/**
 * "Daily news digest" switch. The new state shows at once and is saved in
 * the background; on failure it flips back and a toast says why.
 */
const DigestSwitch = ({ initialEnabled }: { initialEnabled: boolean }) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();
  const labelId = useId();
  const descriptionId = useId();

  const onToggle = () => {
    // Not `disabled` while saving: a disabled button drops keyboard focus.
    if (isPending) return;
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      try {
        const result = await setDigestEnabled(next);
        if (!result.success) {
          setEnabled(!next);
          toast.error(result.error);
          return;
        }
        toast.success(next ? "Daily digest turned on" : "Daily digest turned off");
      } catch (e) {
        console.error(e);
        setEnabled(!next);
        toast.error("Couldn't save the change. Check your connection, then try again.");
      }
    });
  };

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p id={labelId} className="font-medium text-fg">
          Daily news digest
        </p>
        <p id={descriptionId} className="mt-1 text-sm text-fg-secondary">
          One email a day with a summary of the news for the stocks in your watchlist.
        </p>
      </div>
      {/* The state is carried by `aria-checked`; the label and description by ids. */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        aria-disabled={isPending || undefined}
        onClick={onToggle}
        className="inline-flex min-h-11 shrink-0 cursor-pointer items-center rounded-full focus-ring aria-disabled:cursor-wait"
      >
        <span
          aria-hidden="true"
          className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full border transition-colors motion-reduce:transition-none",
            enabled ? "border-brand bg-brand" : "border-control-border bg-surface-hover",
          )}
        >
          <span
            className={cn(
              "inline-block size-5 rounded-full shadow transition-transform motion-reduce:transition-none",
              enabled ? "translate-x-6 bg-surface" : "translate-x-1 bg-fg-secondary",
            )}
          />
        </span>
      </button>
    </div>
  );
};

export default DigestSwitch;
