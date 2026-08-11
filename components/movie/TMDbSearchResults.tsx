"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { searchMoviesClient } from "@/lib/tmdb/client";
import { posterUrl } from "@/lib/tmdb/image";
import { BookmarkIcon, LibraryIcon } from "@/lib/icons";
import type { TMDbSearchResult } from "@/lib/tmdb/types";

export function TMDbSearchResults({
  query,
  onSelect,
  onAddToWishlist,
  wishlistTmdbIds,
  onAddToCollection,
  collectionTmdbIds,
  addingToCollectionIds,
}: {
  query: string;
  onSelect: (result: TMDbSearchResult) => void;
  onAddToWishlist?: (result: TMDbSearchResult) => void;
  wishlistTmdbIds?: Set<number>;
  onAddToCollection?: (result: TMDbSearchResult) => void;
  collectionTmdbIds?: Set<number>;
  addingToCollectionIds?: Set<number>;
}) {
  const [results, setResults] = useState<TMDbSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    const handle = setTimeout(() => {
      searchMoviesClient(query)
        .then((data) => {
          if (!cancelled) setResults(data.results ?? []);
        })
        .catch(() => {
          if (!cancelled) setError("Search failed. Try again.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  if (!query.trim()) return null;
  if (loading) return <p className="text-sm text-muted">Searching...</p>;
  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (results.length === 0)
    return <p className="text-sm text-muted">No matches found.</p>;

  return (
    <ul className="flex flex-col divide-y divide-border rounded-lg border border-border overflow-y-auto">
      {results.map((r) => {
        const poster = posterUrl(r.poster_path, "w92");
        const year = r.release_date ? r.release_date.slice(0, 4) : "—";
        const onWishlist = wishlistTmdbIds?.has(r.id) ?? false;
        const inCollection = collectionTmdbIds?.has(r.id) ?? false;
        const addingToCollection = addingToCollectionIds?.has(r.id) ?? false;
        return (
          <li key={r.id} className="flex flex-col gap-2 p-2">
            <button
              type="button"
              onClick={() => onSelect(r)}
              className="flex min-w-0 items-center gap-3 text-left"
            >
              <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-surface-hover">
                {poster && (
                  <Image src={poster} alt={r.title} fill className="object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted">{year}</p>
              </div>
            </button>
            {(onAddToWishlist || onAddToCollection) && (
              <div className="flex flex-wrap gap-2 pl-14">
                {onAddToWishlist && (
                  <button
                    type="button"
                    onClick={() => onAddToWishlist(r)}
                    disabled={onWishlist}
                    className={
                      onWishlist
                        ? "flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
                        : "flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-accent hover:text-accent"
                    }
                  >
                    <BookmarkIcon
                      className="h-3.5 w-3.5"
                      fill={onWishlist ? "currentColor" : "none"}
                    />
                    {onWishlist ? "On wishlist" : "Add to wishlist"}
                  </button>
                )}
                {onAddToCollection && (
                  <button
                    type="button"
                    onClick={() => onAddToCollection(r)}
                    disabled={inCollection || addingToCollection}
                    className={
                      inCollection
                        ? "flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
                        : "flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted hover:border-accent hover:text-accent disabled:opacity-60"
                    }
                  >
                    <LibraryIcon className="h-3.5 w-3.5" />
                    {inCollection
                      ? "In collection"
                      : addingToCollection
                        ? "Adding..."
                        : "Add to collection"}
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
