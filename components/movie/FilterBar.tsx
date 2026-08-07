"use client";

import clsx from "clsx";
import type { MovieFormat } from "@/lib/firebase/types";
import type { MovieFilters } from "@/lib/filters";

const WATCHED_TABS: { value: MovieFilters["watched"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unwatched", label: "Want to watch" },
  { value: "watched", label: "Watched" },
];

const FORMATS: MovieFormat[] = ["DVD", "Blu-ray", "4K UHD", "Digital"];

function PillTabs<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | null;
  options: { value: T | null; label: string }[];
  onChange: (value: T | null) => void;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.value)}
            className={clsx(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
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
  );
}

export function FilterBar({
  filters,
  onChange,
  genres,
  showSearch = true,
}: {
  filters: MovieFilters;
  onChange: (filters: MovieFilters) => void;
  genres: string[];
  showSearch?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      <PillTabs
        value={filters.watched === "all" ? "all" : filters.watched}
        options={WATCHED_TABS}
        onChange={(watched) => onChange({ ...filters, watched: watched ?? "all" })}
      />

      <div className="flex flex-wrap items-center gap-2">
        {showSearch && (
          <input
            type="text"
            placeholder="Search your collection..."
            value={filters.query}
            onChange={(e) => onChange({ ...filters, query: e.target.value })}
            className="w-48 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm focus:border-accent focus:outline-none"
          />
        )}

        <PillTabs
          value={filters.format}
          options={[
            { value: null, label: "All formats" },
            ...FORMATS.map((f) => ({ value: f, label: f })),
          ]}
          onChange={(format) => onChange({ ...filters, format })}
        />

        <select
          value={filters.genre ?? ""}
          onChange={(e) => onChange({ ...filters, genre: e.target.value || null })}
          className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm focus:border-accent focus:outline-none"
        >
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
