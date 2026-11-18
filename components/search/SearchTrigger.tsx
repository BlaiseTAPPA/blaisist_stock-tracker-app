"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { useSearch } from "@/components/search/SearchProvider";

const noopSubscribe = () => () => {};

// `null` on the server and during hydration, the real value afterwards: React
// re-renders with the client snapshot once hydrated, so there is no mismatch.
export function useIsApplePlatform(): boolean | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent),
    () => null,
  );
}

type SearchTriggerProps = {
  label?: string;
  /** `nav`: styled like a nav link, with the ⌘K hint. `link`: inline text link. */
  variant?: "nav" | "link";
  className?: string;
  /** Runs before the palette opens (e.g. the mobile menu closes itself first). */
  onActivate?: () => void;
};

export default function SearchTrigger({
  label = "Search",
  variant = "nav",
  className,
  onActivate,
}: SearchTriggerProps) {
  const { open } = useSearch();
  const isApple = useIsApplePlatform();

  return (
    <button
      type="button"
      onClick={() => {
        onActivate?.();
        open();
      }}
      aria-haspopup="dialog"
      aria-keyshortcuts="Meta+K Control+K"
      className={cn(
        "cursor-pointer rounded-sm focus-ring transition-colors hover:text-brand",
        variant === "nav" && "inline-flex items-center gap-2",
        className,
      )}
    >
      {label}
      {variant === "nav" && isApple !== null && (
        <kbd
          aria-hidden="true"
          className="rounded border border-border px-1.5 py-0.5 font-sans text-[10px] leading-none text-fg-muted"
        >
          {isApple ? "⌘K" : "Ctrl K"}
        </kbd>
      )}
    </button>
  );
}
