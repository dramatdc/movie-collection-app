export type PosterSize = "w92" | "w154" | "w185" | "w342" | "w500" | "original";

export function posterUrl(
  posterPath: string | null | undefined,
  size: PosterSize = "w342"
): string | null {
  if (!posterPath) return null;
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
}
