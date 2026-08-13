"use client";

import { useEffect, useState } from "react";
import { CompactMovieBox, type CompactMovieItem } from "./CompactMovieBox";
import { posterUrl } from "@/lib/tmdb/image";
import type { TMDbSearchResponse } from "@/lib/tmdb/types";

export function DiscoverRail({
  title,
  fetcher,
}: {
  title: string;
  fetcher: () => Promise<TMDbSearchResponse>;
}) {
  const [items, setItems] = useState<CompactMovieItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetcher()
      .then((data) => {
        if (cancelled) return;
        setItems(
          (data.results ?? []).slice(0, 20).map((m) => ({
            key: String(m.id),
            title: m.title,
            posterUrl: posterUrl(m.poster_path, "w154"),
            href: `/wishlist/${m.id}`,
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items === null || items.length === 0) return null;

  return (
    <CompactMovieBox
      title={title}
      items={items}
      emptyLabel="Nothing to show right now — check back later."
      previewCount={items.length}
    />
  );
}
