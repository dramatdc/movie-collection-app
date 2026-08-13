"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { useRecentSearches } from "@/lib/hooks/useRecentSearches";
import { addToWatchlist, removeFromWatchlist } from "@/lib/firebase/watchlist";
import { TMDbSearchResults } from "@/components/movie/TMDbSearchResults";
import { RecentSearchChips } from "@/components/movie/RecentSearchChips";
import { playAddedChime, playRemovedChime } from "@/lib/sound";
import { CloseIcon } from "@/lib/icons";
import { posterUrl } from "@/lib/tmdb/image";
import type { TMDbSearchResult } from "@/lib/tmdb/types";

export default function WatchlistPage() {
  const { user } = useAuth();
  const { items, loading } = useWatchlist();
  const [searchQuery, setSearchQuery] = useState("");
  const { recent, record } = useRecentSearches("recent-searches-watchlist");

  const watchlistTmdbIds = useMemo(() => new Set(items.map((i) => i.tmdbId)), [items]);

  function handleAdd(result: TMDbSearchResult) {
    if (!user) return;
    record(searchQuery);
    playAddedChime();
    addToWatchlist(user.uid, {
      tmdbId: result.id,
      title: result.title,
      posterPath: result.poster_path,
      year: result.release_date ? Number(result.release_date.slice(0, 4)) : null,
    });
  }

  function handleRemove(tmdbId: number) {
    if (!user) return;
    playRemovedChime();
    removeFromWatchlist(user.uid, tmdbId);
  }

  const sorted = useMemo(() => [...items].sort((a, b) => b.addedAt - a.addedAt), [items]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Watchlist</h1>
        <p className="text-sm text-muted">Movies you want to watch, separate from your collection.</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Search to add
        </h2>
        <input
          type="text"
          placeholder="e.g. The Matrix"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        {!searchQuery.trim() && (
          <RecentSearchChips recent={recent} onSelect={setSearchQuery} />
        )}
        <TMDbSearchResults
          query={searchQuery}
          onSelect={handleAdd}
          onAddToWishlist={handleAdd}
          wishlistTmdbIds={watchlistTmdbIds}
          addLabel="Add to watchlist"
          addedLabel="On watchlist"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          {loading ? "Watchlist" : `${sorted.length} to watch`}
        </h2>

        {!loading && sorted.length === 0 && (
          <p className="text-sm text-muted">
            Nothing here yet — search above to add movies you want to watch.
          </p>
        )}

        <div className="grid grid-cols-3 gap-4">
          {sorted.map((item) => {
            const poster = posterUrl(item.posterPath, "w342");
            return (
              <div key={item.tmdbId} className="flex flex-col gap-1.5">
                <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-surface-hover shadow-lg shadow-black/40">
                  {poster ? (
                    <Image src={poster} alt={item.title} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
                      {item.title}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.tmdbId)}
                    aria-label={`Remove ${item.title} from watchlist`}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="truncate text-xs font-medium">{item.title}</p>
                {item.year && <p className="text-xs text-muted">{item.year}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
