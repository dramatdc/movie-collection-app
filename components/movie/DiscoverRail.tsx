"use client";

import { useEffect, useRef, useState } from "react";
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

const SPEED_PX_PER_SEC = 16;
const RESUME_DELAY_MS = 5000;

export function DiscoverRail({
  title,
  fetcher,
}: {
  title: string;
  fetcher: () => Promise<TMDbSearchResponse>;
}) {
  const [items, setItems] = useState<Item[] | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loopWidthRef = useRef(0);
  // scrollLeft rounds to whole pixels, and each frame only advances a
  // fraction of one at this speed — reading the DOM value back to keep
  // accumulating would throw that fraction away every single frame and the
  // scroll position would never move at all. Tracking it as a separate JS
  // float and only writing (never reading back) to scrollLeft avoids that.
  const scrollPosRef = useRef(0);

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

  // The track below renders the list twice back to back, so once it's
  // painted the loop point is exactly the width of one full set of posters
  // — reset by that amount instead of all the way to 0 for a seamless wrap
  // instead of a visible jump. Measured lazily on the first tick (rather
  // than in its own effect) so there's no race over which one runs first.
  useEffect(() => {
    if (!items || items.length === 0) return;
    let rafId: number;
    let lastTs: number | null = null;

    function tick(ts: number) {
      const el = scrollerRef.current;
      if (el) {
        if (loopWidthRef.current === 0) {
          loopWidthRef.current = el.scrollWidth / 2;
        }
        if (!pausedRef.current && loopWidthRef.current > 0) {
          if (lastTs == null) lastTs = ts;
          const dt = (ts - lastTs) / 1000;
          lastTs = ts;
          scrollPosRef.current += SPEED_PX_PER_SEC * dt;
          if (scrollPosRef.current >= loopWidthRef.current) {
            scrollPosRef.current -= loopWidthRef.current;
          }
          el.scrollLeft = scrollPosRef.current;
        } else {
          // Stay in sync with wherever the user manually scrolled to while
          // paused, so resuming continues from there instead of jumping
          // back to the last auto-scrolled position.
          lastTs = null;
          scrollPosRef.current = el.scrollLeft;
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [items]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  function pauseThenResume() {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY_MS);
  }

  if (items === null || items.length === 0) return null;

  const track = [...items, ...items];

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-base font-semibold">{title}</h2>
      <div
        ref={scrollerRef}
        onPointerDown={pauseThenResume}
        onWheel={pauseThenResume}
        onTouchStart={pauseThenResume}
        className="flex gap-2 overflow-x-auto"
        style={{ scrollBehavior: "auto" }}
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
    </section>
  );
}
