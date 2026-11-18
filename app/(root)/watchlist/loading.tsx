import { PageTitleSkeleton, WatchlistPageSkeleton } from "@/components/dashboard/skeletons";

// Same shape as `/watchlist`: the title, then the card grid.
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitleSkeleton />
      <WatchlistPageSkeleton />
    </div>
  );
}
