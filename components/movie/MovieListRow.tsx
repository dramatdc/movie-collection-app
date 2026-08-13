import Link from "next/link";
import Image from "next/image";
import type { OwnedMovie } from "@/lib/firebase/types";
import { posterUrl } from "@/lib/tmdb/image";
import { FormatBadge } from "./FormatBadge";

export function MovieListRow({ movie }: { movie: OwnedMovie }) {
  const poster = posterUrl(movie.posterPath, "w154");

  return (
    <Link
      href={`/library/${movie.id}`}
      className="flex items-center gap-3 rounded-lg bg-surface px-3 py-2 shadow-md shadow-black/30 hover:ring-2 hover:ring-accent/60 transition"
    >
      <div className="relative aspect-2/3 w-10 shrink-0 overflow-hidden rounded bg-surface-hover">
        {poster ? (
          <Image src={poster} alt={movie.title} fill sizes="40px" className="object-cover" />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="truncate text-sm font-medium">{movie.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted">
          {movie.year && <span>{movie.year}</span>}
          <FormatBadge format={movie.format} />
          {movie.watched && <span className="text-accent">Watched</span>}
        </div>
      </div>
    </Link>
  );
}
