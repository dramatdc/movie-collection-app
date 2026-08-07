"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LibraryIcon, AddIcon, ShuffleIcon, ProfileIcon } from "@/lib/icons";

const ITEMS = [
  { href: "/library", label: "Library", Icon: LibraryIcon },
  { href: "/add", label: "Add", Icon: AddIcon },
  { href: "/picker", label: "Pick", Icon: ShuffleIcon },
  { href: "/profile", label: "Profile", Icon: ProfileIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-10 border-t border-border bg-canvas/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex justify-around">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex flex-col items-center gap-0.5 py-2 px-3 text-xs",
                active ? "text-accent" : "text-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
