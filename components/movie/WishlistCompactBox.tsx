import Image from "next/image";
import Link from "next/link";

export interface WishlistPreviewItem {
  key: string;
  title: string;
  posterUrl: string | null;
}

const PREVIEW_COUNT = 6;

export function WishlistCompactBox({ items }: { items: WishlistPreviewItem[] }) {
  const preview = items.slice(0, PREVIEW_COUNT);

  return (
    <section className="flex flex-col gap-2.5">
      <Link href="/wishlist" className="text-base font-semibold hover:text-accent">
        Wishlist
      </Link>

      <div className="flex flex-col gap-3 rounded-2xl border border-accent/40 bg-surface/60 p-3">
        {preview.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted">Nothing on your wishlist yet.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto">
            {preview.map((item) => (
              <Link
                key={item.key}
                href="/wishlist"
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

        <Link
          href="/wishlist"
          className="flex items-center justify-center gap-1.5 rounded-full border border-accent/50 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/10"
        >
          + View Full Wishlist
        </Link>
      </div>
    </section>
  );
}
