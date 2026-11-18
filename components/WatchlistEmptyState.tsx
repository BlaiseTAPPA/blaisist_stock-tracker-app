import SearchTrigger from "@/components/search/SearchTrigger";

/**
 * Empty watchlist, shared by the dashboard panel and `/watchlist` so the same
 * state reads the same everywhere. The CTA says "Search stocks" because it
 * opens the search palette: stocks are added from their page for now.
 */
export default function WatchlistEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-600 bg-gray-800/30 p-10 text-center sm:p-16">
      <p className="text-sm text-gray-400">Your watchlist is empty.</p>
      <p className="max-w-xs text-xs text-gray-500">
        Add stocks to see their price and daily change here.
      </p>
      <SearchTrigger
        variant="link"
        label="Search stocks"
        className="inline-flex min-h-11 items-center rounded-md bg-yellow-500 px-4 text-sm font-semibold text-gray-900 hover:bg-yellow-400 hover:text-gray-900"
      />
    </div>
  );
}
