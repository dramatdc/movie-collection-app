"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { useMovies } from "@/lib/hooks/useMovies";
import { getMovieDetailClient } from "@/lib/tmdb/client";
import { addToWishlist, removeFromWishlist } from "@/lib/firebase/wishlist";
import { addToWatchlist, removeFromWatchlist } from "@/lib/firebase/watchlist";
import { addOwnedMovie } from "@/lib/firebase/firestore";
import { playAddedChime, playRemovedChime } from "@/lib/sound";
import { posterUrl } from "@/lib/tmdb/image";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { BackButton } from "@/components/ui/BackButton";
import type { TMDbMovieDetail } from "@/lib/tmdb/types";

export default function WishlistDetailPage() {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const id = Number(tmdbId);
  const { user } = useAuth();
  const { items: wishlist } = useWishlist();
  const { items: watchlist } = useWatchlist();
  const { movies } = useMovies();
  const router = useRouter();
  const confirmDialog = useConfirm();

  const [detail, setDetail] = useState<TMDbMovieDetail | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    getMovieDetailClient(id).then(setDetail);
  }, [id]);

  const onWishlist = useMemo(() => wishlist.some((w) => w.tmdbId === id), [wishlist, id]);
  const onWatchlist = useMemo(() => watchlist.some((w) => w.tmdbId === id), [watchlist, id]);
  const inCollection = useMemo(() => movies.some((m) => m.tmdbId === id), [movies, id]);

  if (!detail) {
    return <p className="py-16 text-center text-sm text-muted">Loading...</p>;
  }

  const poster = posterUrl(detail.poster_path, "w500");

  async function handleRemove() {
    if (!user) return;
    playRemovedChime();
    await removeFromWishlist(user.uid, id);
    router.push("/wishlist");
  }

  async function handleAddBack() {
    if (!user || !detail) return;
    if (inCollection) {
      const confirmed = await confirmDialog({
        title: "Already in your collection",
        message: `You already own "${detail.title}". Add it to your wishlist anyway?`,
        confirmLabel: "Add anyway",
      });
      if (!confirmed) return;
    }
    playAddedChime();
    await addToWishlist(user.uid, {
      tmdbId: detail.id,
      title: detail.title,
      posterPath: detail.poster_path,
      year: detail.release_date ? Number(detail.release_date.slice(0, 4)) : null,
    });
  }

  async function handleToggleWatchlist() {
    if (!user || !detail) return;
    if (onWatchlist) {
      playRemovedChime();
      await removeFromWatchlist(user.uid, id);
      return;
    }
    playAddedChime();
    await addToWatchlist(user.uid, {
      tmdbId: detail.id,
      title: detail.title,
      posterPath: detail.poster_path,
      year: detail.release_date ? Number(detail.release_date.slice(0, 4)) : null,
    });
  }

  async function handleAddToCollection() {
    if (!user || !detail) return;
    playAddedChime();
    setSaving(true);
    try {
      await addOwnedMovie(user.uid, {
        tmdbId: detail.id,
        title: detail.title,
        posterPath: detail.poster_path,
        year: detail.release_date ? Number(detail.release_date.slice(0, 4)) : null,
        genres: detail.genres.map((g) => g.name),
        runtimeMinutes: detail.runtime,
        overview: detail.overview,
        format: "Blu-ray",
        location: null,
        watched: false,
        personalRating: null,
        barcodeUpc: null,
        addedVia: "manual",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <BackButton fallbackHref="/wishlist" />
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-2/3 w-full max-w-[220px] shrink-0 overflow-hidden rounded-lg bg-surface-hover shadow-xl shadow-black/50">
          {poster ? (
            <Image src={poster} alt={detail.title} fill unoptimized className="object-cover" />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{detail.title}</h1>
            <p className="text-sm text-muted">
              {detail.release_date?.slice(0, 4)} ·{" "}
              {detail.runtime ? `${detail.runtime} min` : "—"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onWishlist ? (
              <button
                type="button"
                onClick={handleRemove}
                className="rounded border border-red-800 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
              >
                Remove from wishlist
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddBack}
                className="rounded border border-border px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-accent"
              >
                Add back to wishlist
              </button>
            )}

            <button
              type="button"
              onClick={handleAddToCollection}
              disabled={inCollection || saving}
              className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
            >
              {inCollection ? "In your collection" : saving ? "Adding..." : "Add to collection"}
            </button>

            {onWatchlist ? (
              <button
                type="button"
                onClick={handleToggleWatchlist}
                className="rounded border border-red-800 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
              >
                Remove from watchlist
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggleWatchlist}
                className="rounded border border-border px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-accent"
              >
                Add to watchlist
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {detail.genres.map((g) => (
              <span
                key={g.id}
                className="rounded bg-surface-hover px-2 py-0.5 text-xs text-muted"
              >
                {g.name}
              </span>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-neutral-300">{detail.overview}</p>
        </div>
      </div>
    </div>
  );
}
