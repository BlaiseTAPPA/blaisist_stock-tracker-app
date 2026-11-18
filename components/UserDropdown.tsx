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
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
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
        <Button
          variant="ghost"
          // The name is hidden below `lg`: without a label the button would be
          // announced as its initials only.
          aria-label={`Account menu: ${user.name || user.email}`}
          className="flex h-11 items-center gap-3 text-gray-400 hover:text-yellow-500"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-yellow-500 text-sm font-bold text-yellow-900">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden flex-col items-start lg:flex">
            <span className="text-base font-medium text-gray-400">{user.name}</span>
          </div>
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
