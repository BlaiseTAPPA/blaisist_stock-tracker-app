"use client";

import type { StockSearchResult } from "@/types/stock";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import SearchCommand from "@/components/search/SearchCommand";

type SearchContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const SearchContext = createContext<SearchContextValue | null>(null);

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}

// Owns the app's single search palette and the single ⌘K / Ctrl+K listener.
// Triggers (nav, mobile menu, page links) only call `open()`, so they can never
// mount a second palette or a second listener that would cancel the first.
export function SearchProvider({
  initialStocks,
  children,
}: {
  initialStocks: StockSearchResult[];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchCommand open={isOpen} onOpenChange={setIsOpen} initialStocks={initialStocks} />
    </SearchContext.Provider>
  );
}
