import Link from "next/link";

const NAV = [
  { href: "/library", label: "Library" },
  { href: "/add", label: "Add" },
  { href: "/picker", label: "Pick for me" },
  { href: "/profile", label: "Profile" },
];

export function AppHeader() {
  return (
    <header className="hidden md:flex items-center justify-between border-b border-neutral-800 px-6 py-3">
      <Link href="/library" className="font-semibold tracking-tight">
        🎬 My Movie Collection
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
