"use client";

import type { User } from "@/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { signOut } from "@/lib/actions/auth.actions";

/** "Ada Lovelace" → "AL", "ada" → "AD", "" → "?". */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = Array.from(words[0] ?? "");
  const last = words.length > 1 ? Array.from(words.at(-1) ?? "") : [];
  const letters =
    last.length > 0 ? `${first[0] ?? ""}${last[0] ?? ""}` : first.slice(0, 2).join("");
  return letters.toLocaleUpperCase() || "?";
}

const UserDropdown = ({ user }: { user: User }) => {
  const initials = getInitials(user.name);

  const router = useRouter();

  const handleSignout = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Named by its content, so the visible name is part of the accessible
            name (WCAG 2.5.3): "Ada Lovelace, account menu". Below `lg` the
            name is visually hidden but still read. */}
        <Button
          variant="ghost"
          className="flex h-11 items-center gap-3 text-gray-400 hover:text-yellow-500"
        >
          <Avatar className="h-8 w-8" aria-hidden="true">
            <AvatarFallback className="bg-yellow-500 text-sm font-bold text-yellow-900">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-base font-medium text-gray-400 max-lg:sr-only">
            {user.name || user.email}
          </span>
          <span className="sr-only">, account menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 text-gray-400">
        <DropdownMenuLabel>
          <div className="relative flex items-center gap-3 py-2">
            <Avatar className="h-10 w-10" aria-hidden="true">
              <AvatarFallback className="bg-yellow-500 text-sm font-bold text-yellow-900">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-base font-medium text-gray-400">{user.name}</span>
              <span className="text-sm break-all text-gray-500">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-600" />
        <DropdownMenuItem
          asChild
          className="text-md cursor-pointer font-medium text-gray-100 transition-colors focus:bg-gray-700 focus:text-yellow-500"
        >
          <Link href="/settings">
            <Settings className="mr-2 hidden h-4 w-4 sm:block" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignout}
          className="text-md cursor-pointer font-medium text-gray-100 transition-colors focus:bg-gray-700 focus:text-yellow-500"
        >
          <LogOut className="mr-2 hidden h-4 w-4 sm:block" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
