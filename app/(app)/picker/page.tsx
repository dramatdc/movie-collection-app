"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMovies } from "@/lib/hooks/useMovies";
import { FilterBar } from "@/components/movie/FilterBar";
import { MoodChips } from "@/components/movie/MoodChips";
import { FormatBadge } from "@/components/movie/FormatBadge";
import { Randomizer } from "@/components/movie/Randomizer";
import { DEFAULT_FILTERS, applyFilters, collectGenres, type MovieFilters } from "@/lib/filters";
import { posterUrl } from "@/lib/tmdb/image";
import type { OwnedMovie } from "@/lib/firebase/types";

export default function PickerPage() {
  const { movies, loading } = useMovies();
  const [filters, setFilters] = useState<MovieFilters>({
    ...DEFAULT_FILTERS,
    watched: "unwatched",
  });
  const [moods, setMoods] = useState<string[]>([]);
  const [pick, setPick] = useState<OwnedMovie | null>(null);

  const genres = useMemo(() => collectGenres(movies), [movies]);
  const eligible = useMemo(() => {
    const base = applyFilters(movies, filters);
    if (moods.length === 0) return base;
    return base.filter((m) => m.genres.some((g) => moods.includes(g)));
  }, [movies, filters, moods]);

  const poster = pick ? posterUrl(pick.posterPath, "w500") : null;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-3">
      <h1 className="text-xl font-semibold">Pick a movie for me</h1>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        genres={genres}
        showSearch={false}
        showGenre={false}
      />

      <MoodChips genres={genres} selected={moods} onChange={setMoods} />

      {!loading && (
        <p className="text-sm text-muted">
          {eligible.length} {eligible.length === 1 ? "movie matches" : "movies match"} these
          filters.
        </p>
      )}

      <Randomizer eligible={eligible} onLanded={setPick} disabled={loading} />

      {pick && (
        <Link
          href={`/library/${pick.id}`}
          className="flex gap-4 rounded-lg border border-border bg-surface p-4 shadow-lg shadow-black/40"
        >
          <div className="relative aspect-2/3 w-24 shrink-0 overflow-hidden rounded bg-surface-hover shadow-md">
            {poster && <Image src={poster} alt={pick.title} fill className="object-cover" />}
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-medium">{pick.title}</p>
            <p className="text-sm text-muted">
              {pick.year} · {pick.runtimeMinutes ? `${pick.runtimeMinutes} min` : "—"}
            </p>
            <FormatBadge format={pick.format} />
          </div>
        </Link>
      )}

      {eligible.length === 0 && !loading && (
        <p className="text-sm text-muted">
          No movies match these filters — try widening them.
        </p>
      )}
    </div>
  );
}
