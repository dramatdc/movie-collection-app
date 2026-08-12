import { addOwnedMovie } from "@/lib/firebase/firestore";
import { getMovieDetailClient } from "@/lib/tmdb/client";
import type { TMDbSearchResult } from "@/lib/tmdb/types";

// Adds a movie to the owned collection with the same sensible defaults used
// by every "quick add" entry point (search results, barcode scan) — format
// and shelf location stay editable afterward from the movie's detail page.
export async function addMovieToCollection(
  uid: string,
  result: TMDbSearchResult,
  opts: { barcodeUpc: string | null; addedVia: "scan" | "manual" }
) {
  const detail = await getMovieDetailClient(result.id);
  await addOwnedMovie(uid, {
    tmdbId: detail.id,
    title: detail.title,
    posterPath: detail.poster_path,
    year: detail.release_date ? Number(detail.release_date.slice(0, 4)) : null,
    genres: detail.genres.map((g) => g.name),
    runtimeMinutes: detail.runtime,
    overview: detail.overview,
    format: "Blu-ray",
    location: null,
    watched: false,
    personalRating: null,
    barcodeUpc: opts.barcodeUpc,
    addedVia: opts.addedVia,
  });
}
