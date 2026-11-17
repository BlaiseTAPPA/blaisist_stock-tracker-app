"use client";

import React, { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";

type WatchlistButtonProps = {
  symbol: string;
  company: string;
  isInWatchlist: boolean;
  showTrashIcon?: boolean;
  type?: "button" | "icon";
};

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon = false,
  type = "button",
}: WatchlistButtonProps) => {
  const router = useRouter();
  // Confirmed server state, updated from each action result.
  const [confirmed, setConfirmed] = useState<boolean>(!!isInWatchlist);
  // Flips immediately on click; falls back to `confirmed` when the transition
  // ends, so a failed action rolls back on its own.
  const [added, setOptimisticAdded] = useOptimistic(confirmed);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      setOptimisticAdded(!added);

      const result = await toggleWatchlist(symbol, company);

      if (!result.ok) {
        if (result.reason === "unauthenticated") {
          toast.error("Your session has expired. Please sign in again.");
          router.push("/sign-in");
        } else {
          toast.error("Couldn't update your watchlist. Please try again.");
        }
        return;
      }

      // Updates after an `await` must be wrapped again to stay in the transition.
      startTransition(() => setConfirmed(result.added));
      toast.success(
        result.added
          ? `${symbol} added to your watchlist`
          : `${symbol} removed from your watchlist`,
      );
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
        className={`watchlist-icon-btn ${added ? "watchlist-icon-added" : ""}`}
        onClick={handleClick}
        disabled={isPending}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={added ? "#FACC15" : "none"}
          stroke="#FACC15"
          strokeWidth="1.5"
          className="watchlist-star"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={added}
      aria-busy={isPending}
      className={`watchlist-btn ${added ? "watchlist-remove" : ""}`}
      onClick={handleClick}
      disabled={isPending}
    >
      {showTrashIcon && added ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="mr-2 h-5 w-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6m4-6v6"
          />
        </svg>
      ) : null}
      <span>{isPending ? "Saving…" : added ? "Remove from Watchlist" : "Add to Watchlist"}</span>
    </button>
  );
};

export default WatchlistButton;
