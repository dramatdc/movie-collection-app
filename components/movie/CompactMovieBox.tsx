import Image from "next/image";
import Link from "next/link";

export interface CompactMovieItem {
  key: string;
  title: string;
  posterUrl: string | null;
  href: string;
}

const PREVIEW_COUNT = 6;

// Shared "sleek secondary panel" look — a bordered box of small poster
// thumbnails — used to visually separate lighter-weight sections (Wishlist,
// Trending) from the big featured Recently Added rail above them.
export function CompactMovieBox({
  title,
  titleHref,
  items,
  emptyLabel,
  footerHref,
  footerLabel,
}: {
  title: string;
  titleHref?: string;
  items: CompactMovieItem[];
  emptyLabel: string;
  footerHref?: string;
  footerLabel?: string;
}) {
  const preview = items.slice(0, PREVIEW_COUNT);

  const heading = titleHref ? (
    <Link href={titleHref} className="text-base font-semibold hover:text-accent">
      {title}
    </Link>
  ) : (
    <h2 className="text-base font-semibold">{title}</h2>
  );

  return (
    <section className="flex flex-col gap-2.5">
      {heading}

      <div className="flex flex-col gap-3 rounded-2xl border border-accent/40 bg-surface/60 p-3">
        {preview.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted">{emptyLabel}</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto">
            {preview.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="relative aspect-2/3 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-hover"
              >
                {item.posterUrl ? (
                  <Image
                    src={item.posterUrl}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-1 text-center text-[9px] text-muted">
                    {item.title}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {footerHref && (
          <Link
            href={footerHref}
            className="flex items-center justify-center gap-1.5 rounded-full border border-accent/50 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10"
          >
            {footerLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
