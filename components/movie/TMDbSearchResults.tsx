"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { searchMoviesClient } from "@/lib/tmdb/client";
import { posterUrl } from "@/lib/tmdb/image";
import type { TMDbSearchResult } from "@/lib/tmdb/types";

export function TMDbSearchResults({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (result: TMDbSearchResult) => void;
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
  if (loading) return <p className="text-sm text-neutral-500">Searching...</p>;
  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (results.length === 0)
    return <p className="text-sm text-neutral-500">No matches found.</p>;

  return (
    <ul className="flex flex-col divide-y divide-neutral-800 rounded-lg border border-neutral-800">
      {results.map((r) => {
        const poster = posterUrl(r.poster_path, "w92");
        const year = r.release_date ? r.release_date.slice(0, 4) : "—";
        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onSelect(r)}
              className="flex w-full items-center gap-3 p-2 text-left hover:bg-neutral-900"
            >
              <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded bg-neutral-800">
                {poster && (
                  <Image src={poster} alt={r.title} fill className="object-cover" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.title}</p>
                <p className="text-xs text-neutral-500">{year}</p>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
