import Image from "next/image";
import Link from "next/link";
import NavItems from "./NavItems";
import UserDropdown from "./UserDropdown";
import { POPULAR_STOCKS } from "@/lib/constants";

// Default search results: a static list, so rendering the Header costs no
// Finnhub call (it used to fetch 10 /stock/profile2 on every page).
const initialStocks: StockWithWatchlistStatus[] = POPULAR_STOCKS.map((s) => ({
  symbol: s.symbol,
  name: s.name,
  exchange: s.exchange,
  type: "Common Stock",
  isInWatchlist: false,
}));

const Header = ({ user }: { user: User }) => {

  return (
    <header className="sticky top-0 header ">
      <div className="container header-wrapper">
        <Link href="/">
          <Image
            src="/assets/icons/logo.svg"
            alt="Signalist logo"
            width={140}
            height={32}
            className="h-8 w-auto cursor-pointer"
          />   
        </Link>
        <nav className="hidden sm:block">
          <NavItems initialStocks={initialStocks} />
        </nav>
        <UserDropdown user={user} initialStocks={initialStocks} />
      </div>
    </header>
  );
};

export default Header;
