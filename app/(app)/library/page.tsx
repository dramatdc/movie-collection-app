"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useMovies } from "@/lib/hooks/useMovies";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { MovieRail } from "@/components/movie/MovieRail";
import { FilterBar } from "@/components/movie/FilterBar";
import { DEFAULT_FILTERS, applyFilters, collectGenres, sortAlphabetically } from "@/lib/filters";
import { posterUrl } from "@/lib/tmdb/image";

const RECENTLY_ADDED_COUNT = 15;

export default function LibraryPage() {
  const { movies, loading } = useMovies();
  const { items: watchlist } = useWatchlist();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const genres = useMemo(() => collectGenres(movies), [movies]);
  const filtered = useMemo(
    () => sortAlphabetically(applyFilters(movies, filters)),
    [movies, filters]
  );

  const recentlyAdded = useMemo(
    () =>
      [...movies]
        .sort((a, b) => b.dateAdded - a.dateAdded)
        .slice(0, RECENTLY_ADDED_COUNT)
        .map((m) => ({
          key: m.id,
          title: m.title,
          posterUrl: posterUrl(m.posterPath, "w185"),
          href: `/library/${m.id}`,
        })),
    [movies]
  );

  const myList = useMemo(
    () =>
      [...watchlist]
        .sort((a, b) => b.addedAt - a.addedAt)
        .map((w) => ({
          key: String(w.tmdbId),
          title: w.title,
          posterUrl: posterUrl(w.posterPath, "w185"),
        })),
    [watchlist]
  );

  return (
    <div className="flex flex-col gap-6">
      <Image
        src="/brand/wordmark.png"
        alt="Hardcopy"
        width={2695}
        height={431}
        priority
        className="h-7 w-auto md:hidden"
      />

      {!loading && (
        <>
          <MovieRail
            title="Recently Added"
            items={recentlyAdded}
            emptyLabel="Nothing added yet — scan or search to build your shelf."
          />
          <MovieRail
            title="My List"
            items={myList}
            emptyLabel="Nothing on your watchlist yet."
          />
        </>
      )}

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">
            Your collection
            {!loading && (
              <span className="ml-2 text-sm font-normal text-muted">
                {movies.length} {movies.length === 1 ? "title" : "titles"}
              </span>
            )}
          </h1>
        </div>

        <FilterBar filters={filters} onChange={setFilters} genres={genres} />

        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading...</p>
        ) : (
          <MovieGrid movies={filtered} />
        )}
      </div>
    </div>
  );
}
