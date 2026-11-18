"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

/**
 * Re-renders the current route's Server Components (new Finnhub requests
 * once the 60 s Data Cache entry has expired), keeping client state and scroll.
 */
export default function RetryButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className="inline-flex min-h-11 cursor-pointer items-center rounded-sm font-medium text-yellow-500 underline-offset-4 focus-ring hover:underline disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Retrying…" : "Retry"}
    </button>
  );
}
