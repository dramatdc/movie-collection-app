import Link from "next/link";
import Image from "next/image";
import type { OwnedMovie } from "@/lib/firebase/types";
import { posterUrl } from "@/lib/tmdb/image";
import { FormatBadge } from "./FormatBadge";

const WRAPPER_CLASS =
  "flex items-center gap-3 rounded-lg bg-surface px-3 py-2 shadow-md shadow-black/30 hover:ring-2 hover:ring-accent/60 transition";

export function MovieListRow({ movie }: { movie: OwnedMovie }) {
  const poster = posterUrl(movie.posterPath, "w154");
  // Tutorial-only sample data for a new, empty collection — never a real
  // navigable movie, so it shouldn't link anywhere.
  const isPlaceholder = movie.id.startsWith("placeholder-");

  const content = (
    <>
      <div className="relative aspect-2/3 w-10 shrink-0 overflow-hidden rounded bg-surface-hover">
        {poster ? (
          <Image src={poster} alt={movie.title} fill unoptimized sizes="40px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-muted">
            {movie.title.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="truncate text-sm font-medium">{movie.title}</h3>
        <div className="flex items-center gap-2 text-xs text-muted">
          {movie.year && <span>{movie.year}</span>}
          <FormatBadge format={movie.format} />
          {movie.watched && <span className="text-accent">Watched</span>}
        </div>
      </div>
    </>
  );

  if (isPlaceholder) {
    return <div className={WRAPPER_CLASS}>{content}</div>;
  }

  return (
    <Link href={`/library/${movie.id}`} className={WRAPPER_CLASS}>
      {content}
    </Link>
  );
}
