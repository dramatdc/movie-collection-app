import Link from "next/link";
import { LibraryIcon } from "@/lib/icons";

const NAV = [
  { href: "/library", label: "Library" },
  { href: "/add", label: "Add" },
  { href: "/picker", label: "Pick for me" },
  { href: "/profile", label: "Profile" },
];

export function AppHeader() {
  return (
    <header className="hidden md:flex items-center justify-between border-b border-border px-6 py-3">
      <Link
        href="/library"
        className="flex items-center gap-2 font-semibold tracking-tight"
      >
        <LibraryIcon className="h-5 w-5 text-accent" />
        My Movie Collection
      </Link>
      <nav className="flex gap-5 text-sm text-neutral-300">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-white">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
