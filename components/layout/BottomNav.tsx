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

// On the Wishlist, Watchlist, or an individual custom list, the FAB should
// add there instead of to the owned collection — some users specifically
// want that entry point rather than the inline "search to add" box already
// on those pages.
function computeAddHref(pathname: string): string {
  if (pathname.startsWith("/wishlist")) return "/add?mode=wishlist";
  if (pathname.startsWith("/lists/watchlist")) return "/add?mode=watchlist";
  const listMatch = pathname.match(/^\/lists\/([^/]+)$/);
  if (listMatch) return `/add?mode=list&listId=${encodeURIComponent(listMatch[1])}`;
  return "/add";
}

export function BottomNav() {
  const pathname = usePathname();
  const addHref = computeAddHref(pathname);

  return (
    <nav
      data-tutorial="bottom-nav"
      // A normal (non-fixed) flex child of the app shell now, not pinned to
      // the viewport via position:fixed — see the comment in
      // app/(app)/layout.tsx for why. shrink-0 keeps it from being
      // compressed by the shell's flex layout; <main> is the only child
      // that's allowed to give up space.
      className="z-10 shrink-0 bg-bar pb-[env(safe-area-inset-bottom)] md:hidden"
    >
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

        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
          <Link
            href={addHref}
            aria-label="Add a movie"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg ring-4 ring-canvas transition active:scale-90"
          >
            <AddIcon className="h-6 w-6" />
          </Link>
        </div>
        <Link
          href={addHref}
          className="absolute left-1/2 top-8 -translate-x-1/2 text-[10px] font-medium text-accent"
        >
          Add
        </Link>
      </div>
    </nav>
  );
}
