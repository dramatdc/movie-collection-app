import type { OwnedMovie } from "@/lib/firebase/types";

// Shown only during the tour, only for a brand-new account with nothing in
// its collection yet — gives the card/list view toggle something to
// visibly demonstrate. Never written to Firestore; ids are prefixed so
// MovieCard/MovieListRow render them as non-navigable (there's no real
// movie behind them to link to).
export const TUTORIAL_PLACEHOLDER_MOVIES: OwnedMovie[] = [
  {
    id: "placeholder-1",
    tmdbId: -1,
    title: "Sample Movie",
    posterPath: null,
    year: 2020,
    genres: [],
    runtimeMinutes: 104,
    overview: "",
    format: "Blu-ray",
    location: null,
    watched: false,
    personalRating: null,
    dateAdded: 3,
    barcodeUpc: null,
    addedVia: "manual",
  },
  {
    id: "placeholder-2",
    tmdbId: -2,
    title: "Another Favorite",
    posterPath: null,
    year: 2016,
    genres: [],
    runtimeMinutes: 96,
    overview: "",
    format: "DVD",
    location: null,
    watched: true,
    personalRating: null,
    dateAdded: 2,
    barcodeUpc: null,
    addedVia: "manual",
  },
  {
    id: "placeholder-3",
    tmdbId: -3,
    title: "Weekend Watch",
    posterPath: null,
    year: 2023,
    genres: [],
    runtimeMinutes: 118,
    overview: "",
    format: "4K UHD",
    location: null,
    watched: false,
    personalRating: null,
    dateAdded: 1,
    barcodeUpc: null,
    addedVia: "manual",
  },
];
