"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronRightIcon } from "@/lib/icons";

export function MoodChips({
  genres,
  selected,
  onChange,
}: {
  genres: string[];
  selected: string[];
  onChange: (genres: string[]) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollMore, setCanScrollMore] = useState(false);

  function updateScrollHint() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateScrollHint();
  }, [genres]);

  function toggle(genre: string) {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  }

  function scrollHint() {
    scrollerRef.current?.scrollBy({ left: 180, behavior: "smooth" });
  }

  if (genres.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">
        In the mood for something specific? {selected.length > 0 && "(tap to clear)"}
      </p>
      <div className="relative">
        <div
          ref={scrollerRef}
          onScroll={updateScrollHint}
          className="flex gap-3 overflow-x-auto pt-1 pb-6 -mb-5 snap-x snap-mandatory scroll-px-4 -mx-4 px-4"
        >
          {genres.map((genre) => {
            const active = selected.includes(genre);
            return (
              <button
                key={genre}
                type="button"
                onClick={() => toggle(genre)}
                className={clsx(
                  "flex h-16 w-24 shrink-0 snap-start items-center justify-center rounded-2xl px-2 text-center text-sm font-medium leading-tight shadow-lg shadow-black/40 transition active:scale-95",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "bg-surface text-muted hover:bg-surface-hover"
                )}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {canScrollMore && (
          <button
            type="button"
            onClick={scrollHint}
            aria-label="Scroll to see more genres"
            className="absolute right-0 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg animate-pulse"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
