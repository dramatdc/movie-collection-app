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

export function DiscoverRail({
  title,
  fetcher,
}: {
  title: string;
  fetcher: () => Promise<TMDbSearchResponse>;
}) {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((data) => {
        if (cancelled) return;
        setItems(
          (data.results ?? []).slice(0, 20).map((m) => ({
            key: String(m.id),
            title: m.title,
            posterUrl: posterUrl(m.poster_path, "w154"),
            href: `/wishlist/${m.id}`,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items === null || items.length === 0) return null;

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
