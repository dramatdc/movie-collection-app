import type { MovieFormat, OwnedMovie } from "@/lib/firebase/types";

export interface MovieFilters {
  query: string;
  genre: string | null;
  format: MovieFormat | null;
  watched: "all" | "watched" | "unwatched";
  maxRuntime: number | null;
}

export const DEFAULT_FILTERS: MovieFilters = {
  query: "",
  genre: null,
  format: null,
  watched: "all",
  maxRuntime: null,
};

export function applyFilters(movies: OwnedMovie[], filters: MovieFilters): OwnedMovie[] {
  return movies.filter((m) => {
    if (
      filters.query &&
      !m.title.toLowerCase().includes(filters.query.toLowerCase())
    ) {
      return false;
    }
    if (filters.genre && !m.genres.includes(filters.genre)) return false;
    if (filters.format && m.format !== filters.format) return false;
    if (filters.watched === "watched" && !m.watched) return false;
    if (filters.watched === "unwatched" && m.watched) return false;
    if (
      filters.maxRuntime &&
      m.runtimeMinutes &&
      m.runtimeMinutes > filters.maxRuntime
    ) {
      return false;
    }
    return true;
  });
}

export function sortAlphabetically(movies: OwnedMovie[]): OwnedMovie[] {
  return [...movies].sort((a, b) => a.title.localeCompare(b.title));
}

export interface LetterGroup {
  letter: string;
  movies: OwnedMovie[];
}

const ALPHABET_INDEX = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

/** Groups already-alphabetized movies by their leading letter (or "#" for
 * anything not starting with A-Z), preserving that alphabetical order. */
export function groupByLetter(sortedMovies: OwnedMovie[]): LetterGroup[] {
  const groups = new Map<string, OwnedMovie[]>();
  for (const movie of sortedMovies) {
    const first = movie.title.trim().charAt(0).toUpperCase();
    const letter = first >= "A" && first <= "Z" ? first : "#";
    if (!groups.has(letter)) groups.set(letter, []);
    groups.get(letter)!.push(movie);
  }
  return ALPHABET_INDEX.filter((letter) => groups.has(letter)).map((letter) => ({
    letter,
    movies: groups.get(letter)!,
  }));
}

export function collectGenres(movies: OwnedMovie[]): string[] {
  const set = new Set<string>();
  for (const m of movies) {
    for (const g of m.genres) set.add(g);
  }
  return Array.from(set).sort();
}
