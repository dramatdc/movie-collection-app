"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useMovies } from "@/lib/hooks/useMovies";
import { useAuth } from "@/lib/hooks/useAuth";
import { posterUrl } from "@/lib/tmdb/image";
import { FormatBadge } from "@/components/movie/FormatBadge";
import { RatingStars } from "@/components/movie/RatingStars";
import { removeOwnedMovie, updateOwnedMovie } from "@/lib/firebase/firestore";
import { playRemovedChime } from "@/lib/sound";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { BackButton } from "@/components/ui/BackButton";
import { ShareIcon } from "@/lib/icons";
import { shareMovieCard, type ShareCardResult } from "@/lib/shareCard";
import type { MovieFormat } from "@/lib/firebase/types";

const FORMATS: MovieFormat[] = ["DVD", "Blu-ray", "4K UHD", "Digital"];

type ShareButtonState = "idle" | "sharing" | ShareCardResult;

const SHARE_LABELS: Record<ShareButtonState, string> = {
  idle: "Share with friends",
  sharing: "Preparing...",
  copied: "Copied! Paste it anywhere",
  shared: "Shared!",
  opened: "Opened in new tab",
  cancelled: "Share with friends",
};

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { movies } = useMovies();
  const { user } = useAuth();
  const router = useRouter();
  const confirmDialog = useConfirm();
  const [shareState, setShareState] = useState<ShareButtonState>("idle");

  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    return (
      <p className="py-16 text-center text-sm text-muted">
        Movie not found (or still loading).
      </p>
    );
  }

  const poster = posterUrl(movie.posterPath, "w500");

  async function handleDelete() {
    if (!user || !movie) return;
    const confirmed = await confirmDialog({
      title: "Remove from collection?",
      message: `"${movie.title}" will be removed from your collection.`,
      confirmLabel: "Remove",
      tone: "danger",
    });
    if (!confirmed) return;
    playRemovedChime();
    await removeOwnedMovie(user.uid, movie.id);
    router.push("/library");
  }

  async function handleShare() {
    if (!movie) return;
    setShareState("sharing");
    const result = await shareMovieCard({
      title: movie.title,
      year: movie.year,
      format: movie.format,
      posterPath: movie.posterPath,
    });
    setShareState(result);
    if (result !== "cancelled") {
      setTimeout(() => setShareState("idle"), 2200);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <BackButton fallbackHref="/library" />
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="relative aspect-2/3 w-full max-w-[220px] shrink-0 overflow-hidden rounded-lg bg-surface-hover shadow-xl shadow-black/50">
          {poster ? (
            <Image src={poster} alt={movie.title} fill className="object-cover" />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{movie.title}</h1>
            <p className="text-sm text-muted">
              {movie.year} · {movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : "—"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              disabled={shareState === "sharing"}
              className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-70"
            >
              <ShareIcon className="h-4 w-4" />
              {SHARE_LABELS[shareState]}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-fit rounded border border-red-800 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
            >
              Remove from collection
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FormatBadge format={movie.format} />
            {movie.genres.map((g) => (
              <span
                key={g}
                className="rounded bg-surface-hover px-2 py-0.5 text-xs text-muted"
              >
                {g}
              </span>
            ))}
          </div>

          <p className="text-sm leading-relaxed text-neutral-300">{movie.overview}</p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={movie.watched}
                onChange={(e) =>
                  user && updateOwnedMovie(user.uid, movie.id, { watched: e.target.checked })
                }
              />
              Watched
            </label>

            <div className="flex items-center gap-2 text-sm">
              My rating
              <RatingStars
                value={movie.personalRating}
                onChange={(rating) =>
                  user && updateOwnedMovie(user.uid, movie.id, { personalRating: rating })
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <label className="flex items-center gap-2 text-sm">
              Format
              <select
                value={movie.format}
                onChange={(e) =>
                  user &&
                  updateOwnedMovie(user.uid, movie.id, {
                    format: e.target.value as MovieFormat,
                  })
                }
                className="rounded border border-border bg-surface px-2 py-1 text-sm"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm">
              Location
              <input
                type="text"
                defaultValue={movie.location ?? ""}
                placeholder="Shelf, box..."
                onBlur={(e) =>
                  user &&
                  updateOwnedMovie(user.uid, movie.id, {
                    location: e.target.value || null,
                  })
                }
                className="w-32 rounded border border-border bg-surface px-2 py-1 text-sm"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
