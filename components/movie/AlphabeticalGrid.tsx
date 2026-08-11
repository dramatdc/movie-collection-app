"use client";

import { groupByLetter } from "@/lib/filters";
import { MovieCard } from "./MovieCard";
import type { OwnedMovie } from "@/lib/firebase/types";

const ALL_LETTERS = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

function jumpTo(letter: string) {
  document.getElementById(`shelf-${letter}`)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function AlphabeticalGrid({ movies }: { movies: OwnedMovie[] }) {
  if (movies.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-16 text-sm text-muted">
        No movies here yet.
      </div>
    );
  }

  const groups = groupByLetter(movies);
  const available = new Set(groups.map((g) => g.letter));

  return (
    <div className="flex gap-2">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        {groups.map(({ letter, movies: letterMovies }) => (
          <section key={letter} id={`shelf-${letter}`} className="scroll-mt-20">
            <h3 className="mb-2 text-sm font-semibold text-accent">{letter}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {letterMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <nav
        aria-label="Jump to letter"
        className="sticky top-20 flex h-fit shrink-0 flex-col items-center gap-0.5 self-start py-1 text-[10px] font-medium"
      >
        {ALL_LETTERS.map((letter) => (
          <button
            key={letter}
            type="button"
            disabled={!available.has(letter)}
            onClick={() => jumpTo(letter)}
            className={
              available.has(letter)
                ? "text-accent transition hover:scale-125"
                : "text-border"
            }
          >
            {letter}
          </button>
        ))}
      </nav>
    </div>
  );
}
