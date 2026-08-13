"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { hapticImpact } from "@/lib/haptics";

export interface RailItem {
  key: string;
  title: string;
  posterUrl: string | null;
  href?: string;
}

const CARD_WIDTH = 64;
const GAP = 10;
const STRIDE = CARD_WIDTH + GAP;
const FEATURED_SCALE = 1.25;
const MAX_TICKS_PER_FRAME = 8;

export function MovieRail({
  title,
  titleHref,
  items,
  emptyLabel,
  headerAction,
}: {
  title: string;
  titleHref?: string;
  items: RailItem[];
  emptyLabel: string;
  headerAction?: React.ReactNode;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const leadingIndexRef = useRef(0);
  const itemsLengthRef = useRef(items.length);
  const [leadingIndex, setLeadingIndex] = useState(0);

  useEffect(() => {
    itemsLengthRef.current = items.length;
    if (leadingIndexRef.current > items.length - 1) {
      const clamped = Math.max(0, items.length - 1);
      leadingIndexRef.current = clamped;
      setLeadingIndex(clamped);
    }
  }, [items.length]);

  // Mobile browsers (Safari especially) fire very few "scroll" events during
  // a fast momentum fling — sometimes only one, right at the end — so an
  // event-driven handler misses whatever cards flew past in between.
  // Polling the actual scroll position every frame instead means a fast
  // flick still ticks through every card it passes, not just the one it
  // lands on.
  useEffect(() => {
    let rafId: number;
    let lastScrollLeft = -1;

    function loop() {
      const el = scrollerRef.current;
      if (el && el.scrollLeft !== lastScrollLeft) {
        lastScrollLeft = el.scrollLeft;
        const length = itemsLengthRef.current;
        const idx = Math.max(0, Math.min(length - 1, Math.round(el.scrollLeft / STRIDE)));
        const prev = leadingIndexRef.current;
        if (idx !== prev) {
          leadingIndexRef.current = idx;
          setLeadingIndex(idx);
          const steps = Math.min(MAX_TICKS_PER_FRAME, Math.abs(idx - prev));
          for (let i = 0; i < steps; i++) hapticImpact();
        }
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const heading = titleHref ? (
    <Link href={titleHref} className="text-base font-semibold hover:text-accent">
      {title}
    </Link>
  ) : (
    <h2 className="text-base font-semibold">{title}</h2>
  );

  const headerRow = headerAction ? (
    <div className="flex items-center justify-between gap-3">
      {heading}
      {headerAction}
    </div>
  ) : (
    heading
  );

  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-2.5">
        {headerRow}
        <p className="text-sm text-muted">{emptyLabel}</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-2.5">
      {headerRow}

      <div
        ref={scrollerRef}
        className="flex gap-2.5 overflow-x-auto pt-6 pb-12 -mb-9 snap-x snap-mandatory scroll-px-4 -mx-4 px-4"
      >
        {items.map((item, i) => {
          const featured = i === leadingIndex;
          const card = (
            <div
              className="relative aspect-2/3 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface-hover shadow-xl shadow-black/50 active:scale-95"
              style={{
                transform: featured ? `scale(${FEATURED_SCALE})` : undefined,
                outline: featured ? "1.5px solid var(--color-accent)" : undefined,
                outlineOffset: featured ? "1px" : undefined,
                transition: "transform 200ms ease-out",
                zIndex: featured ? 1 : 0,
              }}
            >
              {item.posterUrl ? (
                <Image
                  src={item.posterUrl}
                  alt={item.title}
                  fill
                  sizes="64px"
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
              {item.href ? <Link href={item.href}>{card}</Link> : card}
            </div>
          );
        })}
      </div>
    </section>
  );
}
