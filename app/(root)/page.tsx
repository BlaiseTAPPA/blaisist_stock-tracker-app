import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import SearchTrigger from "@/components/search/SearchTrigger";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import MarketSummarySection from "@/components/dashboard/MarketSummarySection";
import WatchlistSection from "@/components/dashboard/WatchlistSection";
import PopularStocksSection from "@/components/dashboard/PopularStocksSection";
import NewsSection from "@/components/dashboard/NewsSection";
import {
  NewsSkeleton,
  PopularStocksSkeleton,
  WatchlistSkeleton,
} from "@/components/dashboard/skeletons";

export const metadata: Metadata = {
  title: "Dashboard",
};

const viewAllLink = "text-sm text-gray-500 transition-colors hover:text-yellow-500";

// Not async: the titles, the market widget and the skeletons go out in the
// first HTML chunk. Each data section loads its own data (they start in
// parallel) and streams in when ready, so the slowest Finnhub call only delays
// its own section.
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col gap-10">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardPanel title="Market Summary">
          <MarketSummarySection />
        </DashboardPanel>

        <DashboardPanel
          title="Your Watchlist"
          action={
            <Link href="/watchlist" className={viewAllLink}>
              View all
            </Link>
          }
        >
          <Suspense fallback={<WatchlistSkeleton />}>
            <WatchlistSection />
          </Suspense>
        </DashboardPanel>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <DashboardPanel
          title="Today's Top Stocks"
          action={
            <SearchTrigger
              variant="link"
              label="Search all stocks"
              className="text-sm text-gray-500"
            />
          }
        >
          <Suspense fallback={<PopularStocksSkeleton />}>
            <PopularStocksSection />
          </Suspense>
        </DashboardPanel>

        <DashboardPanel
          title="Today's Financial News"
          action={
            <Link href="/news" className={viewAllLink}>
              View all
            </Link>
          }
        >
          <Suspense fallback={<NewsSkeleton />}>
            <NewsSection />
          </Suspense>
        </DashboardPanel>
      </div>
    </div>
  );
}
