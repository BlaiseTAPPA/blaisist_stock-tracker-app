import Header from "@/components/Header";
import { SearchProvider } from "@/components/search/SearchProvider";
import { POPULAR_STOCKS } from "@/lib/constants";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// Default search results: a static list, so rendering the layout costs no
// Finnhub call (the Header used to fetch 10 /stock/profile2 on every page).
const initialStocks: StockWithWatchlistStatus[] = POPULAR_STOCKS.map((s) => ({
  symbol: s.symbol,
  name: s.name,
  exchange: s.exchange,
  type: "Common Stock",
  isInWatchlist: false,
}));

const layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if(!session?.user) redirect("/sign-in");

  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  }

  return (
    <SearchProvider initialStocks={initialStocks}>
      <main className="min-h-screen text-gray-400">
        {/* Header */}
        <Header user={user}/>
        <div className="container py-10">{children}</div>
      </main>
    </SearchProvider>
  );
};

export default layout;
