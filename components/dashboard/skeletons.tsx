// Suspense fallbacks for the dashboard sections, also composed by the
// (root) `loading.tsx`. Same outer sizes as the real sections to limit layout
// shift when they stream in.

import { WATCHLIST_GRID_MAX } from "@/components/WatchlistGrid";

const pulse = "animate-pulse rounded-lg border border-gray-600 bg-gray-800";

/** Announced once per skeleton; the visual blocks are hidden from screen readers. */
const Busy = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div role="status" aria-busy="true">
    <span className="sr-only">{label}</span>
    <div aria-hidden="true">{children}</div>
  </div>
);

export const SectionTitleSkeleton = () => (
  <div aria-hidden="true" className="h-7 w-48 animate-pulse rounded bg-gray-700" />
);

export const MarketSummarySkeleton = () => (
  <Busy label="Loading market summary…">
    <div className={`${pulse} h-[500px]`} />
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
