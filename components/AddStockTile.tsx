"use client";

import { Plus } from "lucide-react";
import { useSearch } from "@/components/search/SearchProvider";

// Last tile of the watchlist grids (dashboard and `/watchlist`): opens the
// search palette, where a stock is added with its star (or Control/Command+Enter).
export default function AddStockTile() {
  const { open } = useSearch();

  return (
    <button
      type="button"
      onClick={open}
      aria-haspopup="dialog"
      className="flex h-full min-h-[130px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-600 bg-gray-800/30 p-3 text-sm font-medium text-gray-400 focus-ring transition-colors hover:border-yellow-500/40 hover:text-yellow-500"
    >
      <Plus className="size-5" aria-hidden="true" />
      Add stock
    </button>
  );
}
