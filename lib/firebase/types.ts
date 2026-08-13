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

export interface WishlistItem {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  year: number | null;
  addedAt: number;
}

export interface CustomList {
  id: string;
  name: string;
  createdAt: number;
}

export type CustomListItem = WishlistItem;

// Letterboxd-style "want to watch" list — entirely separate from the
// physical-media Wishlist (which means "want to buy").
export type WatchlistItem = WishlistItem;

export interface FavoriteMovie {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  year: number | null;
}
