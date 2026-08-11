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

function ScrollablePillTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | null;
  options: { value: T | null; label: string }[];
  onChange: (value: T | null) => void;
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
  }, [options]);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={updateScrollHint}
        className="flex gap-1.5 overflow-x-auto"
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.value)}
              className={clsx(
                "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition",
                active
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface text-muted hover:bg-surface-hover"
              )}
            >
              {opt.label}
            </button>
          );
        })}
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
  return (
    <div className="flex flex-col gap-2">
      <ScrollablePillTabs
        value={filters.watched === "all" ? "all" : filters.watched}
        options={WATCHED_TABS}
        onChange={(watched) => onChange({ ...filters, watched: watched ?? "all" })}
      />

      <ScrollablePillTabs
        value={filters.format}
        options={[
          { value: null, label: "All formats" },
          ...FORMATS.map((f) => ({ value: f, label: f })),
        ]}
        onChange={(format) => onChange({ ...filters, format })}
      />

      {(showSearch || showGenre) && (
        <div className="flex flex-wrap items-center gap-2">
          {showSearch && (
            <input
              type="text"
              placeholder="Search your collection..."
              value={filters.query}
              onChange={(e) => onChange({ ...filters, query: e.target.value })}
              className="w-48 rounded-full border border-border bg-surface px-3 py-1 text-xs focus:border-accent focus:outline-none"
            />
          )}

          {showGenre && (
            <select
              value={filters.genre ?? ""}
              onChange={(e) => onChange({ ...filters, genre: e.target.value || null })}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs focus:border-accent focus:outline-none"
            >
              <option value="">All genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          )}
        </div>
      )}
    </div>
  );
}
