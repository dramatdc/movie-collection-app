import type { OwnedMovie } from "@/lib/firebase/types";
import { MovieCard } from "./MovieCard";

export function MovieGrid({ movies }: { movies: OwnedMovie[] }) {
  if (movies.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-neutral-500 text-sm py-16">
        No movies here yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
