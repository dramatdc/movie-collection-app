"use client";

import { useMemo, useState } from "react";
import { useMovies } from "@/lib/hooks/useMovies";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { AlphabeticalGrid } from "@/components/movie/AlphabeticalGrid";
import { MovieRail } from "@/components/movie/MovieRail";
import { WishlistCompactBox } from "@/components/movie/WishlistCompactBox";
import { DiscoverRail } from "@/components/movie/DiscoverRail";
import { FilterBar } from "@/components/movie/FilterBar";
import { LibraryLookupScanner } from "@/components/scan/LibraryLookupScanner";
import { DEFAULT_FILTERS, applyFilters, collectGenres, sortAlphabetically } from "@/lib/filters";
import { posterUrl } from "@/lib/tmdb/image";
import { getTrendingClient } from "@/lib/tmdb/client";
import { ChevronRightIcon } from "@/lib/icons";

const RECENTLY_ADDED_COUNT = 15;

export default function LibraryPage() {
  const { movies, loading } = useMovies();
  const { items: wishlist } = useWishlist();
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
          posterUrl: posterUrl(m.posterPath, "w154"),
          href: `/library/${m.id}`,
        })),
    [movies]
  );

  const wishlistPreview = useMemo(
    () =>
      [...wishlist]
        .sort((a, b) => b.addedAt - a.addedAt)
        .map((w) => ({
          key: String(w.tmdbId),
          title: w.title,
          posterUrl: posterUrl(w.posterPath, "w154"),
        })),
    [wishlist]
  );

  function jumpToCollection() {
    document.getElementById("your-collection")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const jumpButton = (
    <button
      type="button"
      onClick={jumpToCollection}
      className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent-hover"
    >
      Jump to collection
      <ChevronRightIcon className="h-3.5 w-3.5" style={{ transform: "rotate(90deg)" }} />
    </button>
  );

  return (
    <div className="flex flex-col gap-6">
      {!loading && (
        <>
          <div data-tutorial="recently-added">
            <MovieRail
              title="Recently Added"
              items={recentlyAdded}
              emptyLabel="Nothing added yet — scan or search to build your shelf."
              headerAction={jumpButton}
            />
          </div>

          <div className="flex flex-col gap-6 border-t border-border pt-6">
            <div data-tutorial="wishlist-box">
              <WishlistCompactBox items={wishlistPreview} />
            </div>
            <div data-tutorial="trending-box">
              <DiscoverRail title="Trending This Week" fetcher={getTrendingClient} />
            </div>
          </div>
        </>
      )}

      <div
        id="your-collection"
        data-tutorial="your-collection"
        className="flex flex-col gap-4 border-t border-border pt-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">
            Your collection
            {!loading && (
              <span className="ml-2 text-sm font-normal text-muted">
                {movies.length} {movies.length === 1 ? "title" : "titles"}
              </span>
            )}
          </h1>
          <LibraryLookupScanner movies={movies} />
        </div>

        <FilterBar filters={filters} onChange={setFilters} genres={genres} />

        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading...</p>
        ) : (
          <AlphabeticalGrid movies={filtered} />
        )}
      </div>
    </div>
  );
}
