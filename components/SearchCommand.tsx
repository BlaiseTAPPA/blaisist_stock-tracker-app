"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingUp } from "lucide-react"
import Link from "next/link"
import { searchStocks } from "@/lib/actions/finnhub.actions"
import { useDebounce } from "@/hooks/useDebounce"

export default function SearchCommand({ 
  renderAs = 'button', 
  label = 'Add stock', 
  initialStocks = [] 
}: SearchCommandProps) {

  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks)

  const isSearchMode = !!searchTerm.trim()
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10)

  // Fonction de recherche (avec useCallback)
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setStocks(initialStocks || []);
      return;
    }

    setLoading(true);
    try {
      const results = await searchStocks(searchTerm.trim());
      setStocks(results || []);
    } catch (err) {
      console.error(err);
      setStocks([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, initialStocks]);

  // Debounce
  const debouncedSearch = useDebounce(handleSearch, 400);

  // Déclenchement du debounce quand le texte change
  useEffect(() => {
    debouncedSearch();
  }, [debouncedSearch]);

  // Raccourci clavier
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(v => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  };

  return (
    <>
      {renderAs === 'text' ? (
        <span onClick={() => setOpen(true)} className="search-text">
          {label}
        </span>
      ) : (
        <Button onClick={() => setOpen(true)} className="search-btn">{label}</Button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen} className="search-dialog">
        <Command className="search-field">
          <div >
            <CommandInput
              value={searchTerm}
              onValueChange={setSearchTerm}
              placeholder="Search stocks by name or symbol..."
              /* className="search-input" */
            />
            {loading && <Loader2 className="search-loader" />}
          </div>

          <CommandList className="search-list">
            
            {loading ? (
              <CommandEmpty className="search-list-empty">Loading stocks...</CommandEmpty>
            ) : displayStocks?.length === 0 ? (
              <div className="search-list-indicator">
                {isSearchMode ? 'No results found' : 'No stocks available'}
              </div>
            ) : (
              <ul>
                <div className="search-count">
                  {isSearchMode ? "Search results" : "Popular stocks"} ({displayStocks?.length || 0})
                </div>
                {displayStocks?.map((stock) => (
                  <li key={stock.symbol} className="search-item">
                    <Link
                      href={`/stocks/${stock.symbol}`}
                      onClick={handleSelectStock}
                      className="search-item-link"
                    >
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <div className="flex-1">
                        <div className="search-item-name">{stock.name}</div>
                        <div className="text-sm text-gray-500">
                          {stock.symbol} | {stock.exchange} | {stock.type}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}