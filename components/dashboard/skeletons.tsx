// Suspense fallbacks for the dashboard sections, and the `loading.tsx`
// fallbacks of the (root) pages. Same outer sizes as the real content to limit
// layout shift when it streams in.

import { WATCHLIST_GRID_MAX } from "@/components/WatchlistGrid";

const pulse = "motion-safe:animate-pulse rounded-lg border border-border bg-surface-raised";

/** Announced once per skeleton; the visual blocks are hidden from screen readers. */
const Busy = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div role="status" aria-busy="true">
    <span className="sr-only">{label}</span>
    <div aria-hidden="true">{children}</div>
  </div>
);

/** Matches the `text-title` page `h1` (2 rem line height). */
export const PageTitleSkeleton = () => (
  <div aria-hidden="true" className="h-8 w-56 rounded bg-surface-hover motion-safe:animate-pulse" />
);

/** Generic page: a title and one block, for routes without their own skeleton. */
export const PageSkeleton = () => (
  <div className="flex flex-col gap-6">
    <PageTitleSkeleton />
    <Busy label="Loading…">
      <div className={`${pulse} h-96`} />
    </Busy>
  </div>
);

/** `/watchlist` grid, same columns as `WatchlistSortableGrid`. */
export const WatchlistPageSkeleton = () => (
  <Busy label="Loading your watchlist…">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className={`${pulse} h-[130px]`} />
      ))}
    </div>
  </Busy>
);

/** Stock page: header (logo, name, price, button), chart tabs and chart. */
export const StockPageSkeleton = () => (
  <Busy label="Loading stock…">
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 rounded-lg bg-surface-hover motion-safe:animate-pulse" />
          <div className="flex flex-col gap-2">
            <div className="h-7 w-48 rounded bg-surface-hover motion-safe:animate-pulse" />
            <div className="h-4 w-24 rounded bg-surface-hover motion-safe:animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="h-12 w-40 rounded bg-surface-hover motion-safe:animate-pulse" />
          <div className="h-11 w-full rounded bg-surface-hover motion-safe:animate-pulse sm:w-60" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="h-11 w-24 rounded-full bg-surface-hover motion-safe:animate-pulse" />
          <div className="h-11 w-24 rounded-full bg-surface-hover motion-safe:animate-pulse" />
        </div>
        <div className={`${pulse} h-[380px] md:h-[600px]`} />
      </div>
    </div>
  </Busy>
);

export const WatchlistSkeleton = ({ cards = 6 }: { cards?: number }) => (
  <Busy label="Loading your watchlist…">
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: Math.min(cards, WATCHLIST_GRID_MAX) }).map((_, i) => (
        <div key={i} className={`${pulse} h-[130px]`} />
      ))}
    </div>
  </Busy>
);

export const PopularStocksSkeleton = () => (
  <Busy label="Loading popular stocks…">
    <div className={`${pulse} h-80`} />
  </Busy>
);

export const NewsSkeleton = () => (
  <Busy label="Loading news…">
    <div className={`${pulse} h-80`} />
  </Busy>
);
