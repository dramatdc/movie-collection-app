"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMovies } from "@/lib/hooks/useMovies";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { FilterBar } from "@/components/movie/FilterBar";
import { DEFAULT_FILTERS, applyFilters, collectGenres } from "@/lib/filters";

export default function LibraryPage() {
  const { movies, loading } = useMovies();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const genres = useMemo(() => collectGenres(movies), [movies]);
  const filtered = useMemo(
    () => applyFilters(movies, filters),
    [movies, filters]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">
          Your collection
          {!loading && (
            <span className="ml-2 text-sm font-normal text-muted">
              {movies.length} {movies.length === 1 ? "title" : "titles"}
            </span>
          )}
        </h1>
        <Link
          href="/add"
          className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground"
        >
          + Add movie
        </Link>
      </div>

      <FilterBar filters={filters} onChange={setFilters} genres={genres} />

      {loading ? (
        <p className="py-16 text-center text-sm text-muted">Loading...</p>
      ) : (
        <MovieGrid movies={filtered} />
      )}
    </div>
  );
}
