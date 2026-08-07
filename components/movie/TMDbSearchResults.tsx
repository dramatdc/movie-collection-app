"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { searchMoviesClient } from "@/lib/tmdb/client";
import { posterUrl } from "@/lib/tmdb/image";
import { BookmarkIcon } from "@/lib/icons";
import type { TMDbSearchResult } from "@/lib/tmdb/types";

export function TMDbSearchResults({
  query,
  onSelect,
  onAddToWatchlist,
  watchlistTmdbIds,
}: {
  query: string;
  onSelect: (result: TMDbSearchResult) => void;
  onAddToWatchlist?: (result: TMDbSearchResult) => void;
  watchlistTmdbIds?: Set<number>;
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
        const onWatchlist = watchlistTmdbIds?.has(r.id) ?? false;
        return (
          <li key={r.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(r)}
              className="flex flex-1 min-w-0 items-center gap-3 p-2 text-left hover:bg-surface"
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
            {onAddToWatchlist && (
              <button
                type="button"
                onClick={() => onAddToWatchlist(r)}
                disabled={onWatchlist}
                title={onWatchlist ? "On your watchlist" : "Add to watchlist"}
                className="shrink-0 p-2 mr-1 text-muted hover:text-accent disabled:text-accent"
              >
                <BookmarkIcon
                  className="h-5 w-5"
                  fill={onWatchlist ? "currentColor" : "none"}
                />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
