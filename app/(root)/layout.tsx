import type { StockSearchResult } from "@/types/stock";
import Header from "@/components/Header";
import Disclaimer from "@/components/Disclaimer";
import { SearchProvider } from "@/components/search/SearchProvider";
import { POPULAR_STOCKS } from "@/lib/constants";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Default search results: a static list, so rendering the layout costs no
// Finnhub call (the Header used to fetch 10 /stock/profile2 on every page).
const initialStocks: StockSearchResult[] = POPULAR_STOCKS.map((s) => ({
  symbol: s.symbol,
  name: s.name,
  exchange: s.exchange,
  type: "Common Stock",
  isInWatchlist: false,
}));

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect("/sign-in");

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };

  return (
    <SearchProvider initialStocks={initialStocks}>
      <div className="flex min-h-screen flex-col text-gray-400">
        <a
          href="#main-content"
          className="sr-only z-[60] rounded-md bg-yellow-500 px-4 py-2 font-semibold text-gray-900 focus-ring focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        {/* The header is a banner landmark next to <main>, not inside it. */}
        <Header user={user} />
        <main id="main-content" tabIndex={-1} className="container flex-1 py-10 outline-none">
          {children}
        </main>
        <footer className="border-t border-gray-700">
          <Disclaimer className="container py-6 text-center" />
        </footer>
      </div>
    </SearchProvider>
  );
};

export default layout;
