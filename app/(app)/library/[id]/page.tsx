"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useMovies } from "@/lib/hooks/useMovies";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { useAuth } from "@/lib/hooks/useAuth";
import { posterUrl } from "@/lib/tmdb/image";
import { FormatBadge } from "@/components/movie/FormatBadge";
import { RatingStars } from "@/components/movie/RatingStars";
import { removeOwnedMovie, updateOwnedMovie } from "@/lib/firebase/firestore";
import { addToWatchlist, removeFromWatchlist } from "@/lib/firebase/watchlist";
import { BookmarkIcon } from "@/lib/icons";
import type { MovieFormat } from "@/lib/firebase/types";

const FORMATS: MovieFormat[] = ["DVD", "Blu-ray", "4K UHD", "Digital"];

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { movies } = useMovies();
  const { items: watchlist } = useWatchlist();
  const { user } = useAuth();
  const router = useRouter();

  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    return (
      <p className="py-16 text-center text-sm text-muted">
        Movie not found (or still loading).
      </p>
    );
  }

  const poster = posterUrl(movie.posterPath, "w500");
  const onWatchlist = watchlist.some((w) => w.tmdbId === movie.tmdbId);

  function toggleWatchlist() {
    if (!user || !movie) return;
    if (onWatchlist) {
      removeFromWatchlist(user.uid, movie.tmdbId);
    } else {
      addToWatchlist(user.uid, {
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        year: movie.year,
      });
    }
  }

  async function handleDelete() {
    if (!user || !movie) return;
    if (!confirm(`Remove "${movie.title}" from your collection?`)) return;
    await removeOwnedMovie(user.uid, movie.id);
    router.push("/library");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:flex-row">
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
          <FormatBadge format={movie.format} />
          <button
            type="button"
            onClick={toggleWatchlist}
            className={
              onWatchlist
                ? "flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
                : "flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs text-muted hover:border-accent hover:text-accent"
            }
          >
            <BookmarkIcon
              className="h-3.5 w-3.5"
              fill={onWatchlist ? "currentColor" : "none"}
            />
            {onWatchlist ? "On watchlist" : "Add to watchlist"}
          </button>
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

        <button
          type="button"
          onClick={handleDelete}
          className="mt-4 w-fit rounded border border-red-800 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
        >
          Remove from collection
        </button>
      </div>
    </div>
  );
}
