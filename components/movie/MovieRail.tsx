import Link from "next/link";
import Image from "next/image";

export interface RailItem {
  key: string;
  title: string;
  posterUrl: string | null;
  href?: string;
}

const SIZES = {
  md: { wrapper: "w-28", sizes: "112px" },
  sm: { wrapper: "w-20", sizes: "80px" },
};

export function MovieRail({
  title,
  titleHref,
  items,
  emptyLabel,
  size = "md",
}: {
  title: string;
  titleHref?: string;
  items: RailItem[];
  emptyLabel: string;
  size?: "md" | "sm";
}) {
  const { wrapper, sizes } = SIZES[size];

  return (
    <section className="flex flex-col gap-2.5">
      {titleHref ? (
        <Link href={titleHref} className="text-base font-semibold hover:text-accent">
          {title}
        </Link>
      ) : (
        <h2 className="text-base font-semibold">{title}</h2>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-muted">{emptyLabel}</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pt-3 pb-12 -mb-9 snap-x snap-mandatory scroll-px-4 -mx-4 px-4">
          {items.map((item) => {
            const card = (
              <div
                className={`relative aspect-2/3 ${wrapper} shrink-0 overflow-hidden rounded-2xl bg-surface-hover shadow-xl shadow-black/50 transition active:scale-95`}
              >
                {item.posterUrl ? (
                  <Image
                    src={item.posterUrl}
                    alt={item.title}
                    fill
                    sizes={sizes}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
                    {item.title}
                  </div>
                )}
              </div>
            );
            return (
              <div key={item.key} className="snap-start">
                {item.href ? (
                  <Link href={item.href}>{card}</Link>
                ) : (
                  card
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
