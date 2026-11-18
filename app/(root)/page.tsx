import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import SearchTrigger from "@/components/search/SearchTrigger";
import DashboardPanel from "@/components/dashboard/DashboardPanel";
import MarketSummarySection from "@/components/dashboard/MarketSummarySection";
import WatchlistSection, { WatchlistViewAllLink } from "@/components/dashboard/WatchlistSection";
import MarketStatusBadge from "@/components/dashboard/MarketStatusBadge";
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

// 44 px tall hit area (WCAG 2.5.5) around short text links.
const panelAction = "inline-flex min-h-11 items-center";
const viewAllLink = `${panelAction} focus-ring rounded-sm text-sm text-fg-muted transition-colors hover:text-brand`;

// Not async: the titles, the market widget and the skeletons go out in the
// first HTML chunk. Each data section loads its own data (they start in
// parallel) and streams in when ready, so the slowest Finnhub call only delays
// its own section.
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col gap-10">
      <div className="-mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-title">Dashboard</h1>
        {/* Applies to the whole page. Its own boundary: a slow market-status
            call never holds the heading or any section. */}
        <Suspense fallback={null}>
          <MarketStatusBadge />
        </Suspense>
      </div>

      {/* The user's watchlist comes first in the DOM, so it is the first block
          on a phone and first in reading and tab order; from xl up the market
          summary sits beside it. */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardPanel
          title="Your watchlist"
          action={
            <Suspense
              fallback={
                <Link href="/watchlist" className={viewAllLink}>
                  View all
                </Link>
              }
            >
              <WatchlistViewAllLink className={viewAllLink} />
            </Suspense>
          }
        >
          <Suspense fallback={<WatchlistSkeleton />}>
            <WatchlistSection />
          </Suspense>
        </DashboardPanel>

        <DashboardPanel title="Market summary">
          <MarketSummarySection />
        </DashboardPanel>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
        <DashboardPanel
          title="Popular stocks"
          action={
            <SearchTrigger
              variant="link"
              label="Search all stocks"
              className={`${panelAction} text-sm text-fg-muted`}
            />
          }
        >
          <Suspense fallback={<PopularStocksSkeleton />}>
            <PopularStocksSection />
          </Suspense>
        </DashboardPanel>

        <DashboardPanel
          title="Financial news"
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
