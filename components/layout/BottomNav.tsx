"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LibraryIcon, ListIcon, ShuffleIcon, ProfileIcon, AddIcon } from "@/lib/icons";

const LEFT_ITEMS = [
  { href: "/library", label: "Library", Icon: LibraryIcon },
  { href: "/lists", label: "Lists", Icon: ListIcon },
];
const RIGHT_ITEMS = [
  { href: "/picker", label: "Pick", Icon: ShuffleIcon },
  { href: "/profile", label: "Profile", Icon: ProfileIcon },
];

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: typeof LibraryIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex flex-col items-center gap-0.5 text-xs",
        active ? "text-accent" : "text-muted"
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 bg-bar pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="relative h-16">
        {/* Bar with a notch cut into the top edge, centered, for the FAB to nest into */}
        <svg
          viewBox="0 0 100 16"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d="M0,0 H37 C41,0 43,5 50,5 C57,5 59,0 63,0 H100 V16 H0 Z"
            fill="var(--color-bar)"
          />
        </svg>

        <div className="relative flex h-full items-center justify-between px-6">
          <div className="flex flex-1 items-center justify-start gap-8">
            {LEFT_ITEMS.map(({ href, label, Icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                Icon={Icon}
                active={pathname.startsWith(href)}
              />
            ))}
          </div>
          <div className="flex flex-1 items-center justify-end gap-8">
            {RIGHT_ITEMS.map(({ href, label, Icon }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                Icon={Icon}
                active={pathname.startsWith(href)}
              />
            ))}
          </div>
        </div>

        <Link
          href="/add"
          aria-label="Add a movie"
          className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg ring-4 ring-canvas transition active:scale-90"
        >
          <AddIcon className="h-6 w-6" />
        </Link>
      </div>
    </nav>
  );
}
