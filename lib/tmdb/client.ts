import type { TMDbMovieDetail, TMDbSearchResponse } from "./types";

export async function searchMoviesClient(query: string): Promise<TMDbSearchResponse> {
  const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export async function getMovieDetailClient(id: number): Promise<TMDbMovieDetail> {
  const res = await fetch(`/api/tmdb/movie/${id}`);
  if (!res.ok) throw new Error("Failed to load movie detail");
  return res.json();
}

export async function getNowPlayingClient(): Promise<TMDbSearchResponse> {
  const res = await fetch("/api/tmdb/now-playing");
  if (!res.ok) throw new Error("Failed to load now-playing movies");
  return res.json();
}

export async function getTrendingClient(): Promise<TMDbSearchResponse> {
  const res = await fetch("/api/tmdb/trending");
  if (!res.ok) throw new Error("Failed to load trending movies");
  return res.json();
}
