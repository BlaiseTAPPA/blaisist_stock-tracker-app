"use client";

import type { StockSearchResult } from "@/types/stock";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import StarIcon from "@/components/StarIcon";
import { useIsApplePlatform } from "@/components/search/SearchTrigger";
import { searchStocksAction } from "@/lib/actions/finnhub.actions";
import { getWatchlistSymbolsAction, toggleWatchlist } from "@/lib/actions/watchlist.actions";

const DEBOUNCE_MS = 300;
const MAX_QUERY_LENGTH = 32; // same bound as the server action's validation
const MAX_COMPANY_LENGTH = 120; // same bound as toggleWatchlist's validation

type SearchCommandProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStocks: StockSearchResult[];
};

// Mounted once, by SearchProvider. The palette body lives inside the dialog
// content, which Radix unmounts when the dialog closes: the query, the results,
// the watchlist state and any pending timer are dropped on close, and nothing
// runs while closed.
export default function SearchCommand({ open, onOpenChange, initialStocks }: SearchCommandProps) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search stocks"
      description="Search stocks by name or symbol. Press Enter to open the selected stock, or Control+Enter (Command+Enter on a Mac) to add it to or remove it from your watchlist."
      className="search-dialog"
    >
      <SearchPalette initialStocks={initialStocks} onNavigate={() => onOpenChange(false)} />
    </CommandDialog>
  );
}

type SearchResults = { query: string; stocks: StockSearchResult[]; failed: boolean };

const toggleFailedMessage = (symbol: string) =>
  `Couldn't update your watchlist for ${symbol}. Try again in a moment.`;

/**
 * The user's watchlist symbols, read once per opening of the palette (the
 * palette body mounts on open, so the layout never waits for the database),
 * and toggled optimistically. `followed` is `null` while loading or when the
 * read failed: no star is shown then, rather than a wrong state.
 */
function useWatchlistToggle(onUnauthenticated: () => void) {
  const [followed, setFollowed] = useState<ReadonlySet<string> | null>(null);
  const pendingRef = useRef(new Set<string>());
  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWatchlistSymbolsAction()
      .then((result) => {
        if (!cancelled && result.ok) setFollowed(new Set(result.symbols));
      })
      .catch((err) => console.error("Watchlist read failed:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = useCallback(
    async (stock: StockSearchResult) => {
      const { symbol } = stock;
      // One request at a time per symbol: a second press during the first is ignored.
      if (!followed || pendingRef.current.has(symbol)) return;

      const wasFollowed = followed.has(symbol);
      const apply = (add: boolean) =>
        setFollowed((prev) => {
          const next = new Set(prev);
          if (add) next.add(symbol);
          else next.delete(symbol);
          return next;
        });

      pendingRef.current.add(symbol);
      apply(!wasFollowed); // optimistic
      try {
        const company = (stock.name || symbol).slice(0, MAX_COMPANY_LENGTH);
        const result = await toggleWatchlist(symbol, company);
        if (!result.ok) {
          apply(wasFollowed);
          if (result.reason === "unauthenticated") return onUnauthenticated();
          setAnnouncement(toggleFailedMessage(symbol));
          return;
        }
        apply(result.added);
        setAnnouncement(
          result.added
            ? `${symbol} added to your watchlist`
            : `${symbol} removed from your watchlist`,
        );
      } catch (err) {
        console.error("Watchlist toggle failed:", err);
        apply(wasFollowed);
        setAnnouncement(toggleFailedMessage(symbol));
      } finally {
        pendingRef.current.delete(symbol);
      }
    },
    [followed, onUnauthenticated],
  );

  const clearAnnouncement = useCallback(() => setAnnouncement(null), []);

  return { followed, toggle, announcement, clearAnnouncement };
}

function SearchPalette({
  initialStocks,
  onNavigate,
}: {
  initialStocks: StockSearchResult[];
  onNavigate: () => void;
}) {
  const router = useRouter();
  const isApple = useIsApplePlatform();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  // Incremented for every scheduled search: only the response whose id is
  // still the latest is applied, so a slow "app" can't overwrite "apple".
  const requestIdRef = useRef(0);

  const onUnauthenticated = useCallback(() => {
    onNavigate();
    router.push("/sign-in");
  }, [onNavigate, router]);
  const { followed, toggle, announcement, clearAnnouncement } =
    useWatchlistToggle(onUnauthenticated);

  const trimmed = query.trim();
  const isSearchMode = trimmed.length > 0;

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    if (!trimmed) return;

    const timer = setTimeout(async () => {
      let next: SearchResults;
      try {
        next = { query: trimmed, stocks: await searchStocksAction(trimmed), failed: false };
      } catch (err) {
        console.error("Stock search failed:", err);
        next = { query: trimmed, stocks: [], failed: true };
      }
      if (requestId === requestIdRef.current) setResults(next);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [trimmed]);

  const loading = isSearchMode && results?.query !== trimmed;
  const stocks = isSearchMode ? (loading ? [] : results!.stocks) : initialStocks.slice(0, 10);

  let status: string;
  if (!isSearchMode) status = `${stocks.length} popular stocks`;
  else if (loading) status = "Loading…";
  else if (results?.failed) status = "Search is unavailable right now. Try again in a few seconds.";
  else if (stocks.length === 0) status = `No results for “${trimmed}”`;
  else status = `${stocks.length} result${stocks.length === 1 ? "" : "s"}`;

  const handleSelect = (symbol: string) => {
    onNavigate();
    router.push(`/stocks/${encodeURIComponent(symbol)}`);
  };

  // Control/Command+Enter toggles the active result's star. This handler runs
  // before cmdk's own, which skips a default-prevented event: Enter alone
  // still opens the stock page.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter" || !(e.ctrlKey || e.metaKey) || e.nativeEvent.isComposing) return;
    e.preventDefault();
    const active = e.currentTarget.querySelector<HTMLElement>('[cmdk-item][aria-selected="true"]');
    const stock = stocks.find((s) => s.symbol === active?.dataset.value);
    if (stock) void toggle(stock);
  };

  const shortcut = isApple ? "⌘ Enter" : "Ctrl Enter";

  return (
    // Filtering is done by the server (Finnhub /search), not by cmdk.
    <Command shouldFilter={false} className="search-field" onKeyDown={handleKeyDown}>
      <div className="relative">
        <CommandInput
          value={query}
          onValueChange={(value) => {
            setQuery(value);
            clearAnnouncement();
          }}
          maxLength={MAX_QUERY_LENGTH}
          placeholder="Search stocks by name or symbol…"
          aria-keyshortcuts="Control+Enter Meta+Enter"
        />
        {loading && <Loader2 className="search-loader" aria-hidden="true" />}
      </div>

      {/* One live region: the result count, or the outcome of the last toggle. */}
      <p aria-live="polite" role="status" className="sr-only">
        {announcement ?? status}
      </p>

      <CommandList className="search-list">
        {stocks.length === 0 ? (
          <div className="search-list-empty" aria-hidden="true">
            {!isSearchMode ? "No stocks available" : status}
          </div>
        ) : (
          <CommandGroup
            heading={
              isSearchMode
                ? `Search results (${stocks.length})`
                : `Popular stocks (${stocks.length})`
            }
          >
            {stocks.map((stock) => {
              const isFollowed = followed?.has(stock.symbol) ?? false;
              return (
                <CommandItem
                  key={stock.symbol}
                  value={stock.symbol}
                  onSelect={() => handleSelect(stock.symbol)}
                  className="search-item cursor-pointer"
                >
                  <TrendingUp className="h-4 w-4 text-gray-500" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <div className="search-item-name truncate">{stock.name}</div>
                    <div className="text-sm text-gray-500">
                      {[stock.symbol, stock.exchange, stock.type].filter(Boolean).join(" · ")}
                      {isFollowed && <span className="sr-only">, in your watchlist</span>}
                    </div>
                  </div>
                  {followed && (
                    // Not a button: an option can't contain interactive content.
                    // Mouse only (not focusable, hidden from screen readers):
                    // keyboard users press Control/Command+Enter and hear the
                    // outcome in the status region.
                    <span
                      aria-hidden="true"
                      data-testid={`watchlist-star-${stock.symbol}`}
                      title={
                        isFollowed
                          ? `Remove ${stock.symbol} from watchlist (${shortcut})`
                          : `Add ${stock.symbol} to watchlist (${shortcut})`
                      }
                      onClick={(e) => {
                        // Keeps cmdk's item click (open the page) from running.
                        e.preventDefault();
                        e.stopPropagation();
                        void toggle(stock);
                      }}
                      className="search-item-star"
                    >
                      <StarIcon filled={isFollowed} />
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>

      {/* Visual hint and feedback. Screen readers get both from the dialog
          description and the status region above. */}
      <div aria-hidden="true" className="search-footer">
        <span>
          <kbd>Enter</kbd> Open
        </span>
        {followed && (
          <span>
            <kbd>{shortcut}</kbd> Add to / remove from watchlist
          </span>
        )}
        {announcement && <span className="ml-auto text-gray-300">{announcement}</span>}
      </div>
    </Command>
  );
}
