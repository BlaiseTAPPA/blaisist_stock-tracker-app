"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import NavItems from "@/components/NavItems";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Main navigation below `sm`. The Sheet is a Radix Dialog: focus is trapped
// inside while it is open, Escape closes it and focus returns to the button.
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  // Set when the item activated opens another dialog (the search palette):
  // focus must then stay with that dialog instead of returning to the button.
  const skipFocusReturn = useRef(false);

  const handleNavigate = (target: "link" | "search") => {
    skipFocusReturn.current = target === "search";
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="sm:hidden -ml-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-gray-400 transition-colors hover:text-yellow-500 focus-visible:outline-2 focus-visible:outline-yellow-500"
      >
        <Menu className="size-6" aria-hidden="true" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 border-gray-600 bg-gray-800 text-gray-400"
        onCloseAutoFocus={(e) => {
          if (skipFocusReturn.current) e.preventDefault();
          skipFocusReturn.current = false;
        }}
      >
        <SheetHeader className="border-b border-gray-600">
          <SheetTitle>
            <Image src="/assets/icons/logo.svg" alt="Signalist" width={140} height={32} className="h-8 w-auto" />
          </SheetTitle>
          <SheetDescription className="sr-only">Main navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Main" className="px-2">
          <NavItems variant="sheet" onNavigate={handleNavigate} />
        </nav>
      </SheetContent>
    </Sheet>
  );
}
