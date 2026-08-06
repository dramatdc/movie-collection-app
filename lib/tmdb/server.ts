import "server-only";
import type { TMDbMovieDetail, TMDbSearchResponse } from "./types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function apiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error(
      "TMDB_API_KEY is not set. Get a free key at https://www.themoviedb.org/settings/api and add it to .env.local"
    );
  }
  return key;
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", apiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!res.ok) {
    throw new Error(`TMDb request failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export function searchMovies(query: string): Promise<TMDbSearchResponse> {
  return tmdbFetch<TMDbSearchResponse>("/search/movie", { query });
}

export function getMovieDetail(id: string): Promise<TMDbMovieDetail> {
  return tmdbFetch<TMDbMovieDetail>(`/movie/${id}`, {
    append_to_response: "credits",
  });
}
