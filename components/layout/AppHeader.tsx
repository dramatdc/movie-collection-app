import Link from "next/link";
import Image from "next/image";

const NAV = [
  { href: "/library", label: "Library" },
  { href: "/add", label: "Add" },
  { href: "/picker", label: "Pick for me" },
  { href: "/profile", label: "Profile" },
];

export function AppHeader() {
  return (
    <header className="hidden md:flex items-center justify-between border-b border-border px-6 py-3">
      <Link href="/library" className="flex items-center">
        <Image
          src="/brand/wordmark.png"
          alt="Hardcopy"
          width={2695}
          height={431}
          priority
          className="h-7 w-auto"
        />
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
