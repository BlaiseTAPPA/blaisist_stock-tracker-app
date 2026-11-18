import SearchTrigger from "@/components/search/SearchTrigger";

/**
 * Empty watchlist, shared by the dashboard panel and `/watchlist` so the same
 * state reads the same everywhere. The CTA opens the search palette, where a
 * stock is added with its star (or Control/Command+Enter).
 */
export default function WatchlistEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface-raised/30 p-10 text-center sm:p-16">
      <p className="text-sm text-fg-secondary">Your watchlist is empty.</p>
      <p className="max-w-xs text-xs text-fg-muted">
        Add stocks to see their price and daily change here.
      </p>
      <SearchTrigger
        variant="link"
        label="Add stocks"
        className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 text-sm font-semibold text-on-brand hover:bg-brand-hover hover:text-on-brand"
      />
    </div>
  );
}
