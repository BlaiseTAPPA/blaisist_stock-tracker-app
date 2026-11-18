"use client";

import { NAV_ITEMS } from "@/lib/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchTrigger from "@/components/search/SearchTrigger";
import { cn } from "@/lib/utils";

type NavItemsProps = {
  /** `bar`: horizontal header nav. `sheet`: vertical list with 44 px touch targets. */
  variant?: "bar" | "sheet";
  /** Called when an item is activated (the mobile sheet closes itself with it). */
  onNavigate?: (target: "link" | "search") => void;
};

const NavItems = ({ variant = "bar", onNavigate }: NavItemsProps) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";

    return pathname.startsWith(path);
  };

  const isSheet = variant === "sheet";
  const itemClass = isSheet
    ? "flex min-h-11 w-full items-center rounded-md px-3 text-base hover:bg-surface-hover/50"
    : "";

  return (
    <ul
      className={cn(
        "flex font-medium",
        isSheet ? "flex-col gap-1" : "flex-row gap-6 p-2 lg:gap-10",
      )}
    >
      {NAV_ITEMS.map((item) => {
        if ("action" in item)
          return (
            <li key="search-trigger">
              <SearchTrigger
                label={item.label}
                onActivate={() => onNavigate?.("search")}
                className={itemClass}
              />
            </li>
          );

        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate?.("link")}
              className={cn(
                "rounded-sm focus-ring transition-colors hover:text-brand",
                itemClass,
                // Not only lighter: a 2 px underline marks the current page (1.4.1).
                active && "text-fg underline decoration-brand decoration-2 underline-offset-8",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
};
export default NavItems;
