"use client";

import { useState } from "react";
import Image from "next/image";
import { CloseIcon, ShareIcon } from "@/lib/icons";
import { posterUrl } from "@/lib/tmdb/image";
import type { ShareCardMovie } from "@/lib/shareCard";
import { ShareCardModal } from "@/components/movie/ShareCardModal";

export function MovieAddedCard({
  movie,
  onDismiss,
}: {
  movie: ShareCardMovie | null;
  onDismiss: () => void;
}) {
  // Captured into its own state on open, independent of the `movie` prop —
  // the popup below can auto-dismiss (or the tutorial can move on) while
  // this modal is still open, and it shouldn't yank the card away
  // mid-interaction just because the toast-like popup that launched it went
  // away on its own timer. Kept as a separate render below rather than
  // nested inside the `!movie` early return for exactly that reason.
  const [shareCardMovie, setShareCardMovie] = useState<ShareCardMovie | null>(null);

  const poster = movie ? posterUrl(movie.posterPath, "w154") : null;

  return (
    <>
      {movie && (
        // Same eye-line anchor as Toast — below the header, not off at the
        // bottom of the screen where it's easy to miss.
        <div
          className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4"
          style={{ top: "calc(5.5rem + env(safe-area-inset-top))" }}
        >
          <div
            data-tutorial="movie-added-card"
            className="pointer-events-auto flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-2xl shadow-black/50 animate-[fade-in-up_0.2s_ease-out]"
          >
            <div className="flex items-start gap-3">
              <div className="relative aspect-2/3 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-hover">
                {poster ? (
                  <Image src={poster} alt={movie.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-1 text-center text-[9px] text-muted">
                    {movie.title}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-xs font-medium uppercase tracking-wide text-accent">
                  Added to your collection
                </p>
                <p className="truncate text-base font-semibold">{movie.title}</p>
                <p className="text-xs text-muted">
                  {[movie.year, movie.format].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={onDismiss}
                aria-label="Dismiss"
                className="shrink-0 text-muted hover:text-white"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShareCardMovie(movie)}
              className="flex items-center justify-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            >
              <ShareIcon className="h-4 w-4" />
              Share with friends
            </button>
          </div>
        </div>
      )}

      {shareCardMovie && (
        <ShareCardModal movie={shareCardMovie} onClose={() => setShareCardMovie(null)} />
      )}
    </>
  );
}
