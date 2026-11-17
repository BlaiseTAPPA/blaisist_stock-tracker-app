import type { User } from "@/types/user";
import Image from "next/image";
import Link from "next/link";
import NavItems from "./NavItems";
import MobileNav from "./MobileNav";
import UserDropdown from "./UserDropdown";

const Header = ({ user }: { user: User }) => {

  return (
    <header className="sticky top-0 header ">
      <div className="container header-wrapper">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link href="/" className="inline-flex min-h-11 items-center">
            <Image
              src="/assets/icons/logo.svg"
              alt="Signalist logo"
              width={140}
              height={32}
              className="h-8 w-auto cursor-pointer"
            />
          </Link>
        </div>
        <nav aria-label="Main" className="hidden sm:block">
          <NavItems />
        </nav>
        <UserDropdown user={user} />
      </div>
    </header>
  );
};

export default Header;
