"use client";

import type { StockSearchResult } from "@/types/stock";
import { useEffect, useRef, useState } from "react";
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
import { searchStocksAction } from "@/lib/actions/finnhub.actions";

const DEBOUNCE_MS = 300;
const MAX_QUERY_LENGTH = 32; // same bound as the server action's validation

type SearchCommandProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStocks: StockSearchResult[];
};

// Mounted once, by SearchProvider. The palette body lives inside the dialog
// content, which Radix unmounts when the dialog closes: the query, the results
// and any pending timer are dropped on close, and no search runs while closed.
export default function SearchCommand({ open, onOpenChange, initialStocks }: SearchCommandProps) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search stocks"
      description="Search stocks by name or symbol, then press Enter to open one."
      className="search-dialog"
    >
      <SearchPalette initialStocks={initialStocks} onNavigate={() => onOpenChange(false)} />
    </CommandDialog>
  );
}

type SearchResults = { query: string; stocks: StockSearchResult[]; failed: boolean };

function SearchPalette({
  initialStocks,
  onNavigate,
}: {
  initialStocks: StockSearchResult[];
  onNavigate: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  // Incremented for every scheduled search: only the response whose id is
  // still the latest is applied, so a slow "app" can't overwrite "apple".
  const requestIdRef = useRef(0);

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

  return (
    // Filtering is done by the server (Finnhub /search), not by cmdk.
    <Command shouldFilter={false} className="search-field">
      <div className="relative">
        <CommandInput
          value={query}
          onValueChange={setQuery}
          maxLength={MAX_QUERY_LENGTH}
          placeholder="Search stocks by name or symbol…"
        />
        {loading && <Loader2 className="search-loader" aria-hidden="true" />}
      </div>

      <p aria-live="polite" role="status" className="sr-only">
        {status}
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
            {stocks.map((stock) => (
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
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
