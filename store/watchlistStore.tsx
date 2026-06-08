import { create } from 'zustand';

export type StockWithData = {
  symbol: string;
  company: string;
  priceFormatted?: string;
  changeFormatted?: string;
  changePercent?: number;
  
  // Rends les champs venant de la base de données optionnels
  userId?: string;
  addedAt?: string | Date;
  // Ajoute ici tous les autres champs obligatoires que tu as avec ?:
};

type WatchlistStore = {
  watchlist: StockWithData[];
  addToWatchlist: (stock: StockWithData) => void;
  removeFromWatchlist: (symbol: string) => void;
  setWatchlist: (stocks: StockWithData[]) => void;
};

export const useWatchlistStore = create<WatchlistStore>((set) => ({
  watchlist: [],

  addToWatchlist: (stock) =>
    set((state) => ({
      watchlist: [...state.watchlist, stock],
    })),

  removeFromWatchlist: (symbol) =>
    set((state) => ({
      watchlist: state.watchlist.filter((s) => s.symbol !== symbol),
    })),

  setWatchlist: (stocks) => set({ watchlist: stocks }),
}));