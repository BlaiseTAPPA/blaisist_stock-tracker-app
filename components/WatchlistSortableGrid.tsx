"use client";

import { useId, useMemo } from "react";
import { useSearchParams } from "next/navigation";

export const WATCHLIST_SORTS = {
  recent: "Recently added",
  name: "Name (A–Z)",
  change: "Change % (high to low)",
} as const;

export type WatchlistSort = keyof typeof WATCHLIST_SORTS;

const isWatchlistSort = (value: string | null): value is WatchlistSort =>
  value !== null && Object.hasOwn(WATCHLIST_SORTS, value);

export type SortableWatchlistItem = {
  symbol: string;
  company: string;
  changePercent?: number;
  /** Server-rendered card, reordered here without re-rendering it. */
  card: React.ReactNode;
};

const byName = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });

function sortItems(items: SortableWatchlistItem[], sort: WatchlistSort): SortableWatchlistItem[] {
  // `items` arrive newest first (the DB order), which is the "recent" order.
  if (sort === "recent") return items;
  const sorted = [...items];
  if (sort === "name") {
    sorted.sort((a, b) => byName.compare(a.company, b.company));
  } else {
    // Highest change first; stocks without a quote go last.
    sorted.sort(
      (a, b) =>
        (b.changePercent ?? Number.NEGATIVE_INFINITY) -
        (a.changePercent ?? Number.NEGATIVE_INFINITY),
    );
  }
  return sorted;
}

/**
 * Client-side sort of the watchlist cards, kept in `?sort=`. The URL is
 * updated with `history.replaceState`: Next syncs `useSearchParams` with it
 * and no server round trip happens (the quotes are already on the page).
 */
export default function WatchlistSortableGrid({ items }: { items: SortableWatchlistItem[] }) {
  const selectId = useId();
  const searchParams = useSearchParams();
  const param = searchParams.get("sort");
  const sort: WatchlistSort = isWatchlistSort(param) ? param : "recent";

  const sorted = useMemo(() => sortItems(items, sort), [items, sort]);

  const updateSort = (value: string) => {
    const params = new URLSearchParams(window.location.search);
    if (value === "recent") params.delete("sort");
    else params.set("sort", value);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  };

  return (
    <div className="flex flex-col gap-4">
      {items.length > 1 && (
        <div className="flex items-center gap-2 self-end">
          <label htmlFor={selectId} className="text-sm text-gray-400">
            Sort by
          </label>
          <select
            id={selectId}
            value={sort}
            onChange={(e) => updateSort(e.target.value)}
            className="min-h-11 cursor-pointer rounded-md border border-gray-600 bg-gray-800 px-3 text-sm text-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500"
          >
            {Object.entries(WATCHLIST_SORTS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {sorted.map((item) => (
          <li key={item.symbol} className="min-w-0">
            {item.card}
          </li>
        ))}
      </ul>
    </div>
  );
}
