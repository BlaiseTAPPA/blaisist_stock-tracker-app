"use client";

import React, { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { cn } from "@/lib/utils";
import { Check, Loader2 } from "lucide-react";
import StarIcon from "@/components/StarIcon";
import type { ToggleWatchlistResult } from "@/types/watchlist";

type Router = ReturnType<typeof useRouter>;

type WatchlistButtonProps = {
  symbol: string;
  company: string;
  isInWatchlist: boolean;
  type?: "button" | "icon";
  /** Extra classes for the icon variant (e.g. positioning inside a card). */
  className?: string;
};

/** Long enough to reach the "Undo" button, by mouse or with the toaster hotkey. */
const UNDO_TOAST_MS = 8_000;

function toastFailure(result: Extract<ToggleWatchlistResult, { ok: false }>, router: Router) {
  if (result.reason === "unauthenticated") {
    toast.error("Your session has expired. Sign in again.");
    router.push("/sign-in");
  } else {
    toast.error("Couldn't update your watchlist. Try again in a moment.");
  }
}

/**
 * "Undo" of a removal: adds the stock back with its original date. A module
 * function, not a closure over the button's state: a watchlist card unmounts
 * as soon as the page refreshes without it, before the user can click "Undo".
 */
async function undoRemoval(symbol: string, company: string, addedAt: string, router: Router) {
  const result = await toggleWatchlist(symbol, company, { addedAt });
  if (!result.ok) return toastFailure(result, router);
  toast.success(`${symbol} is back in your watchlist`);
}

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  type = "button",
  className,
}: WatchlistButtonProps) => {
  const router = useRouter();
  // Confirmed server state, updated from each action result, and from the
  // prop when the page re-renders with a new value (e.g. after an "Undo").
  const [confirmed, setConfirmed] = useState<boolean>(!!isInWatchlist);
  const [prevProp, setPrevProp] = useState(isInWatchlist);
  if (prevProp !== isInWatchlist) {
    setPrevProp(isInWatchlist);
    setConfirmed(isInWatchlist);
  }
  // Flips immediately on click; falls back to `confirmed` when the transition
  // ends, so a failed action rolls back on its own.
  const [added, setOptimisticAdded] = useOptimistic(confirmed);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      setOptimisticAdded(!added);

      const result = await toggleWatchlist(symbol, company);

      if (!result.ok) return toastFailure(result, router);

      // Updates after an `await` must be wrapped again to stay in the transition.
      startTransition(() => setConfirmed(result.added));
      if (result.added) {
        toast.success(`${symbol} added to your watchlist`);
      } else {
        const { addedAt } = result;
        toast.success(`${symbol} removed from your watchlist`, {
          duration: UNDO_TOAST_MS,
          action: {
            label: "Undo",
            onClick: () => void undoRemoval(symbol, company, addedAt, router),
          },
        });
      }
    });
  };

  if (type === "icon") {
    const iconLabel = added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`;
    return (
      <button
        type="button"
        title={iconLabel}
        aria-label={iconLabel}
        aria-pressed={added}
        aria-busy={isPending}
        // 44 px touch target with its own focus ring, distinct from the card's.
        className={cn(
          "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-brand focus-ring transition-colors hover:bg-surface-hover/60 disabled:cursor-wait disabled:opacity-60",
          className,
        )}
        onClick={handleClick}
        disabled={isPending}
      >
        <StarIcon filled={added} />
      </button>
    );
  }

  // Followed: a quiet outline "In watchlist" that reveals "Remove from
  // watchlist" on hover and keyboard focus (CSS, see `.watchlist-btn`), so the
  // destructive action isn't the page's loudest element. While saving, the
  // label already shows the target state (optimistic) with a small spinner.
  return (
    <button
      type="button"
      aria-pressed={added}
      aria-busy={isPending}
      className="watchlist-btn group"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" />
      ) : added ? (
        <Check
          aria-hidden="true"
          className="size-4 group-hover:hidden group-focus-visible:hidden"
        />
      ) : null}
      {added ? (
        <>
          <span className={isPending ? undefined : "group-hover:hidden group-focus-visible:hidden"}>
            In watchlist
          </span>
          {!isPending && (
            <span className="hidden group-hover:inline group-focus-visible:inline">
              Remove from watchlist
            </span>
          )}
        </>
      ) : (
        <span>Add to watchlist</span>
      )}
    </button>
  );
};

export default WatchlistButton;
