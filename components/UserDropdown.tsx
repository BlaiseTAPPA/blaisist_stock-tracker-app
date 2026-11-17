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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth.actions";

const UserDropdown = ({ user }: { user: User }) => {
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
          className="flex h-11 items-center gap-3 text-gray-400 hover:text-yellow-500"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="bg-yellow-500 text-sm font-bold text-yellow-900">
              {user.name[0]}
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
            <Avatar className="h-10 w-10">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-yellow-500 text-sm font-bold text-yellow-900">
                {user.name[0]}
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
          className="text-md cursor-pointer font-medium text-gray-100 transition-colors focus:bg-transparent focus:text-yellow-500"
        >
          <LogOut className="mr-2 hidden h-4 w-4 sm:block" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
