"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMovies } from "@/lib/hooks/useMovies";
import { FilterBar } from "@/components/movie/FilterBar";
import { FormatBadge } from "@/components/movie/FormatBadge";
import { DEFAULT_FILTERS, applyFilters, collectGenres, type MovieFilters } from "@/lib/filters";
import { posterUrl } from "@/lib/tmdb/image";
import type { OwnedMovie } from "@/lib/firebase/types";

export default function PickerPage() {
  const { movies, loading } = useMovies();
  const [filters, setFilters] = useState<MovieFilters>({
    ...DEFAULT_FILTERS,
    watched: "unwatched",
  });
  const [pick, setPick] = useState<OwnedMovie | null>(null);

  const genres = useMemo(() => collectGenres(movies), [movies]);
  const eligible = useMemo(() => applyFilters(movies, filters), [movies, filters]);

  function pickRandom() {
    if (eligible.length === 0) {
      setPick(null);
      return;
    }
    const choice = eligible[Math.floor(Math.random() * eligible.length)];
    setPick(choice);
  }

  const poster = pick ? posterUrl(pick.posterPath, "w500") : null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4">
      <h1 className="text-xl font-semibold">Pick a movie for me</h1>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        genres={genres}
        showSearch={false}
      />

      {!loading && (
        <p className="text-sm text-neutral-500">
          {eligible.length} {eligible.length === 1 ? "movie matches" : "movies match"} these
          filters.
        </p>
      )}

      <button
        type="button"
        onClick={pickRandom}
        disabled={loading || eligible.length === 0}
        className="rounded bg-emerald-400 px-4 py-2.5 text-sm font-medium text-black disabled:opacity-50"
      >
        🎲 Pick something
      </button>

      {pick && (
        <Link
          href={`/library/${pick.id}`}
          className="flex gap-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4"
        >
          <div className="relative aspect-2/3 w-24 shrink-0 overflow-hidden rounded bg-neutral-800">
            {poster && <Image src={poster} alt={pick.title} fill className="object-cover" />}
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">{pick.title}</p>
            <p className="text-sm text-neutral-400">
              {pick.year} · {pick.runtimeMinutes ? `${pick.runtimeMinutes} min` : "—"}
            </p>
            <FormatBadge format={pick.format} />
          </div>
        </Link>
      )}

      {eligible.length === 0 && !loading && (
        <p className="text-sm text-neutral-500">
          No movies match these filters — try widening them.
        </p>
      )}
    </div>
  );
}
