import Link from "next/link";
import Image from "next/image";

const NAV = [
  { href: "/library", label: "Library" },
  { href: "/add", label: "Add" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/lists", label: "Lists" },
  { href: "/picker", label: "Pick for me" },
  { href: "/profile", label: "Profile" },
];

export function AppHeader() {
  return (
    <header
      className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-canvas px-4 py-1.5 md:px-6"
      style={{ paddingTop: "max(0.375rem, env(safe-area-inset-top))" }}
    >
      <Link href="/library" className="flex items-center">
        <Image
          src="/brand/wordmark.png"
          alt="Hardcopy"
          width={2695}
          height={431}
          priority
          className="h-6 w-auto md:h-7"
        />
      </Link>
      <nav data-tutorial="bottom-nav" className="hidden gap-5 text-sm text-neutral-300 md:flex">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-white">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
