"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ChevronRightIcon } from "@/lib/icons";
import type { MovieFormat } from "@/lib/firebase/types";
import type { MovieFilters } from "@/lib/filters";

const WATCHED_TABS: { value: MovieFilters["watched"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unwatched", label: "Want to watch" },
  { value: "watched", label: "Watched" },
];

const FORMATS: MovieFormat[] = ["DVD", "Blu-ray", "4K UHD", "Digital"];

type Chip =
  | { kind: "divider"; key: string }
  | { kind: "option"; key: string; label: string; active: boolean; onClick: () => void };

function ScrollableChipRow({ chips }: { chips: Chip[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollMore, setCanScrollMore] = useState(false);

  function updateScrollHint() {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollMore(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  }

  useEffect(() => {
    updateScrollHint();
  }, [chips.length]);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={updateScrollHint}
        className="flex items-center gap-1.5 overflow-x-auto"
      >
        {chips.map((chip) =>
          chip.kind === "divider" ? (
            <span key={chip.key} className="h-4 w-px shrink-0 bg-border" />
          ) : (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onClick}
              className={clsx(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition",
                chip.active
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface text-muted hover:bg-surface-hover"
              )}
            >
              {chip.label}
            </button>
          )
        )}
      </div>

      {canScrollMore && (
        <button
          type="button"
          onClick={() => scrollerRef.current?.scrollBy({ left: 140, behavior: "smooth" })}
          aria-label="Scroll to see more options"
          className="absolute right-0 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
  genres,
  showSearch = true,
  showGenre = true,
}: {
  filters: MovieFilters;
  onChange: (filters: MovieFilters) => void;
  genres: string[];
  showSearch?: boolean;
  showGenre?: boolean;
}) {
  const chips: Chip[] = [
    ...WATCHED_TABS.map((tab) => ({
      kind: "option" as const,
      key: `watched-${tab.value}`,
      label: tab.label,
      active: filters.watched === tab.value,
      onClick: () => onChange({ ...filters, watched: tab.value }),
    })),
    { kind: "divider" as const, key: "divider-format" },
    {
      kind: "option" as const,
      key: "format-all",
      label: "All formats",
      active: filters.format === null,
      onClick: () => onChange({ ...filters, format: null }),
    },
    ...FORMATS.map((f) => ({
      kind: "option" as const,
      key: `format-${f}`,
      label: f,
      active: filters.format === f,
      onClick: () => onChange({ ...filters, format: f }),
    })),
  ];

  if (showGenre && genres.length > 0) {
    chips.push(
      { kind: "divider" as const, key: "divider-genre" },
      {
        kind: "option" as const,
        key: "genre-all",
        label: "All genres",
        active: filters.genre === null,
        onClick: () => onChange({ ...filters, genre: null }),
      },
      ...genres.map((g) => ({
        kind: "option" as const,
        key: `genre-${g}`,
        label: g,
        active: filters.genre === g,
        onClick: () => onChange({ ...filters, genre: g }),
      }))
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {showSearch && (
        <input
          type="text"
          placeholder="Search your collection..."
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs focus:border-accent focus:outline-none"
        />
      )}
      <ScrollableChipRow chips={chips} />
    </div>
  );
}
