"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb/image";
import type { TMDbSearchResponse } from "@/lib/tmdb/types";

interface Item {
  key: string;
  title: string;
  posterUrl: string | null;
  href: string;
}

// Must match the card's own w-14 (56px) + gap-2 (8px) below — used to work
// out the animation duration for a steady, size-independent speed.
const CARD_WIDTH = 56;
const GAP = 8;
const SPEED_PX_PER_SEC = 40;

// Keyed by the fetcher function itself (a stable, module-level reference
// like getTrendingClient) rather than a fixed string, so this stays correct
// if DiscoverRail is ever reused with a different feed. Without this,
// navigating away from the library tab and back remounted the component
// from scratch every time and re-fetched over the network, causing a brief
// blank flash each time — everything else on that page survives navigation
// via a cached subscription (see createSubscription.ts) and reappears
// instantly; this makes the trending rail behave the same way.
const cache = new Map<() => Promise<TMDbSearchResponse>, Item[]>();

export function DiscoverRail({
  title,
  fetcher,
}: {
  title: string;
  fetcher: () => Promise<TMDbSearchResponse>;
}) {
  const [items, setItems] = useState<Item[] | null>(cache.get(fetcher) ?? null);

  useEffect(() => {
    if (cache.has(fetcher)) return;
    let cancelled = false;
    fetcher()
      .then((data) => {
        if (cancelled) return;
        const mapped = (data.results ?? []).slice(0, 20).map((m) => ({
          key: String(m.id),
          title: m.title,
          posterUrl: posterUrl(m.poster_path, "w154"),
          href: `/wishlist/${m.id}`,
        }));
        cache.set(fetcher, mapped);
        setItems(mapped);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [fetcher]);

  // While the TMDb fetch is in flight, a skeleton reserves the same space
  // the real row will occupy — this is a network call, unrelated to (and
  // often slower/less predictable than) the app's own Firestore data, so it
  // can resolve at any time. Rendering nothing at all until it does (the
  // previous behavior) meant the whole section would pop into existence
  // from zero height whenever it happened to land, an uncontrolled layout
  // shift for anything relying on the page's layout being stable — the
  // tutorial spotlight most notably, since one of its steps targets this
  // exact section.
  if (items === null) {
    return (
      <section className="flex flex-col gap-2.5">
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="flex w-max gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="aspect-2/3 w-14 shrink-0 animate-pulse rounded-lg bg-surface-hover"
            />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  const track = [...items, ...items];
  // A CSS-driven transform loop instead of a requestAnimationFrame +
  // scrollLeft loop — GPU-composited, so it stays smooth regardless of how
  // busy the main thread is, rather than fighting layout/scroll on every
  // frame. Duration is derived from the actual track width so the visual
  // speed (px/sec) stays constant no matter how many items are in it.
  // There's no native scrolling here to pause for — it never stops, so a
  // tap on a poster (to open it) doesn't visibly interrupt the reel either.
  const singleSetWidth = items.length * CARD_WIDTH + (items.length - 1) * GAP;
  const durationSec = singleSetWidth / SPEED_PX_PER_SEC;

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="overflow-hidden">
        <div
          className="flex w-max gap-2"
          style={{ animation: `marquee-scroll ${durationSec}s linear infinite` }}
        >
          {track.map((item, i) => (
            <Link
              key={`${item.key}-${i}`}
              href={item.href}
              className="relative aspect-2/3 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-hover"
            >
              {item.posterUrl ? (
                <Image
                  src={item.posterUrl}
                  alt={item.title}
                  fill
                  unoptimized
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
      </div>
    </section>
  );
}
