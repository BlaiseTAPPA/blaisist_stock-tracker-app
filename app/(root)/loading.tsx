// Navigation fallback for (root) pages while their server component renders.
// The layout (session check + Header) stays visible above it. On the dashboard
// the page itself streams section by section, so this only shows until its
// static shell arrives.

import {
  MarketSummarySkeleton,
  NewsSkeleton,
  PopularStocksSkeleton,
  SectionTitleSkeleton,
  WatchlistSkeleton,
} from "@/components/dashboard/skeletons";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <SectionTitleSkeleton />
          <MarketSummarySkeleton />
        </div>
        <div className="flex flex-col gap-4">
          <SectionTitleSkeleton />
          <WatchlistSkeleton />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PopularStocksSkeleton />
        <NewsSkeleton />
      </div>
    </div>
  );
}
