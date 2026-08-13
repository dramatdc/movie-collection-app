"use client";

import { useEffect, useMemo, useState } from "react";
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
import { ChevronRightIcon, LibraryIcon, ListIcon } from "@/lib/icons";
import {
  getCollectionViewMode,
  setCollectionViewMode,
  VIEW_MODE_KEY,
  type CollectionViewMode,
} from "@/lib/preferences";
import { useTutorial } from "@/lib/tutorial/TutorialContext";
import { TUTORIAL_PLACEHOLDER_MOVIES } from "@/lib/tutorial/placeholderMovies";

const RECENTLY_ADDED_COUNT = 15;

export default function LibraryPage() {
  const { movies, loading } = useMovies();
  const { items: wishlist } = useWishlist();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<CollectionViewMode>("card");
  const tutorial = useTutorial();

  useEffect(() => {
    setViewMode(getCollectionViewMode());
    // The tutorial resets this from a different component when it ends —
    // pick that up here rather than only reading it once on mount.
    function sync() {
      setViewMode(getCollectionViewMode());
    }
    window.addEventListener(VIEW_MODE_KEY, sync);
    return () => window.removeEventListener(VIEW_MODE_KEY, sync);
  }, []);

  function handleSetView(mode: CollectionViewMode) {
    setViewMode(mode);
    setCollectionViewMode(mode);
    if (tutorial.active && tutorial.step?.id === "view-toggle") {
      setTimeout(() => tutorial.next(), 700);
    }
  }

  const genres = useMemo(() => collectGenres(movies), [movies]);
  const filtered = useMemo(
    () => sortAlphabetically(applyFilters(movies, filters)),
    [movies, filters]
  );
  // A brand-new account has nothing to show the card/list toggle actually
  // doing — fill it with a few sample entries during the tour only, so
  // switching views has something visible to demonstrate. The instant a
  // real movie exists, this never shows again, tour or not.
  const showPlaceholders = tutorial.active && !loading && movies.length === 0;
  const displayedMovies = showPlaceholders
    ? sortAlphabetically(TUTORIAL_PLACEHOLDER_MOVIES)
    : filtered;

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
          <div className="flex items-center gap-2">
            <div
              data-tutorial="view-toggle"
              className="flex shrink-0 items-center gap-0.5 rounded-full border border-border p-0.5"
            >
              <button
                type="button"
                onClick={() => handleSetView("card")}
                aria-label="Card view"
                className={`flex items-center justify-center rounded-full p-1.5 transition ${
                  viewMode === "card"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:text-accent"
                }`}
              >
                <LibraryIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleSetView("list")}
                aria-label="List view"
                className={`flex items-center justify-center rounded-full p-1.5 transition ${
                  viewMode === "list"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted hover:text-accent"
                }`}
              >
                <ListIcon className="h-4 w-4" />
              </button>
            </div>
            <LibraryLookupScanner movies={movies} />
          </div>
        </div>

        <FilterBar filters={filters} onChange={setFilters} genres={genres} />

        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading...</p>
        ) : (
          <AlphabeticalGrid movies={displayedMovies} view={viewMode} />
        )}
      </div>
    </div>
  );
}
