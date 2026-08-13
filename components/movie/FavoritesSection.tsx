"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFavorites } from "@/lib/hooks/useFavorites";
import { addFavorite, removeFavorite, MAX_FAVORITES } from "@/lib/firebase/favorites";
import { TMDbSearchResults } from "./TMDbSearchResults";
import { CloseIcon, AddIcon } from "@/lib/icons";
import { posterUrl } from "@/lib/tmdb/image";
import { playAddedChime, playRemovedChime } from "@/lib/sound";
import type { TMDbSearchResult } from "@/lib/tmdb/types";
import type { FavoriteMovie } from "@/lib/firebase/types";

export function FavoritesSection() {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");

  const favoriteTmdbIds = new Set(favorites.map((f) => f.tmdbId));

  async function handlePick(result: TMDbSearchResult) {
    if (!user || favorites.length >= MAX_FAVORITES) return;
    playAddedChime();
    await addFavorite(user.uid, {
      tmdbId: result.id,
      title: result.title,
      posterPath: result.poster_path,
      year: result.release_date ? Number(result.release_date.slice(0, 4)) : null,
    });
    setPicking(false);
    setQuery("");
  }

  async function handleRemove(movie: FavoriteMovie) {
    if (!user) return;
    playRemovedChime();
    await removeFavorite(user.uid, movie);
  }

  const slots = Array.from({ length: MAX_FAVORITES }, (_, i) => favorites[i] ?? null);

  return (
    <section className="flex flex-col gap-2.5">
      <div>
        <h2 className="text-base font-semibold">Favorites</h2>
        <p className="text-sm text-muted">Your top {MAX_FAVORITES}, front and center.</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {slots.map((movie, i) => {
          const poster = movie ? posterUrl(movie.posterPath, "w154") : null;
          return (
            <div
              key={movie?.tmdbId ?? `empty-${i}`}
              className="relative aspect-2/3 overflow-hidden rounded-xl bg-surface-hover shadow-lg shadow-black/40"
            >
              {movie ? (
                <>
                  {poster ? (
                    <Image src={poster} alt={movie.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-1 text-center text-[10px] text-muted">
                      {movie.title}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(movie)}
                    aria-label={`Remove ${movie.title} from favorites`}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <CloseIcon className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setPicking(true)}
                  aria-label="Add a favorite"
                  className="flex h-full w-full items-center justify-center text-muted hover:text-accent"
                >
                  <AddIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {picking && (
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Pick a favorite
            </p>
            <button
              type="button"
              onClick={() => {
                setPicking(false);
                setQuery("");
              }}
              aria-label="Cancel"
              className="text-muted hover:text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <input
            type="text"
            autoFocus
            placeholder="e.g. The Matrix"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded border border-border bg-canvas px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <TMDbSearchResults
            query={query}
            onSelect={handlePick}
            onAddToWishlist={handlePick}
            wishlistTmdbIds={favoriteTmdbIds}
            addLabel="Add to favorites"
            addedLabel="In favorites"
          />
        </div>
      )}
    </section>
  );
}
