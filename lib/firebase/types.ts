export type MovieFormat = "DVD" | "Blu-ray" | "4K UHD" | "Digital";

export interface OwnedMovie {
  id: string;
  tmdbId: number;
  title: string;
  posterPath: string | null;
  year: number | null;
  genres: string[];
  runtimeMinutes: number | null;
  overview: string;
  format: MovieFormat;
  location: string | null;
  watched: boolean;
  personalRating: number | null;
  dateAdded: number;
  barcodeUpc: string | null;
  addedVia: "scan" | "manual";
}

export type NewOwnedMovie = Omit<OwnedMovie, "id" | "dateAdded">;

export interface WatchlistItem {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  year: number | null;
  addedAt: number;
}
