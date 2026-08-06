import Link from "next/link";
import Image from "next/image";
import type { OwnedMovie } from "@/lib/firebase/types";
import { posterUrl } from "@/lib/tmdb/image";
import { FormatBadge } from "./FormatBadge";

export function MovieCard({ movie }: { movie: OwnedMovie }) {
  const poster = posterUrl(movie.posterPath, "w342");

  return (
    <Link
      href={`/library/${movie.id}`}
      className="group flex flex-col gap-2 rounded-xl overflow-hidden bg-neutral-900 hover:ring-2 hover:ring-emerald-400/60 transition"
    >
      <div className="relative aspect-2/3 bg-neutral-800 rounded-xl overflow-hidden">
        {poster ? (
          <Image
            src={poster}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 45vw, 200px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-500 text-sm px-2 text-center">
            {movie.title}
          </div>
        )}
        {movie.watched && (
          <span className="absolute top-1.5 right-1.5 bg-emerald-400 text-black text-[10px] font-medium px-1.5 py-0.5 rounded-full">
            Watched
          </span>
        )}
      </div>
      <div className="px-1 pb-2 flex flex-col gap-1">
        <h3 className="text-sm font-medium leading-tight line-clamp-2">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          {movie.year && <span>{movie.year}</span>}
          <FormatBadge format={movie.format} />
        </div>
      </div>
    </Link>
  );
}
