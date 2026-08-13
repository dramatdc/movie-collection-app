import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./client";
import { removeFromWishlist } from "./wishlist";
import type { NewOwnedMovie, OwnedMovie } from "./types";

function moviesCollection(uid: string) {
  return collection(db, "users", uid, "movies");
}

export function movieDocId(tmdbId: number, format: string) {
  return `${tmdbId}_${format.replace(/\s+/g, "")}`;
}

export async function addOwnedMovie(uid: string, movie: NewOwnedMovie) {
  const id = movieDocId(movie.tmdbId, movie.format);
  await setDoc(doc(moviesCollection(uid), id), {
    ...movie,
    dateAdded: serverTimestamp(),
  });
  // Now owned, so it no longer needs to be on the "want to buy" list —
  // a harmless no-op if it was never on the wishlist to begin with.
  await removeFromWishlist(uid, movie.tmdbId);
  return id;
}

export async function updateOwnedMovie(
  uid: string,
  id: string,
  changes: Partial<NewOwnedMovie>
) {
  await updateDoc(doc(moviesCollection(uid), id), changes);
}

export async function removeOwnedMovie(uid: string, id: string) {
  await deleteDoc(doc(moviesCollection(uid), id));
}

export function subscribeToMovies(
  uid: string,
  callback: (movies: OwnedMovie[]) => void
) {
  return onSnapshot(moviesCollection(uid), (snapshot) => {
    const movies = snapshot.docs.map((d) => {
      const data = d.data();
      const dateAdded =
        data.dateAdded instanceof Timestamp
          ? data.dateAdded.toMillis()
          : Date.now();
      return { id: d.id, ...data, dateAdded } as OwnedMovie;
    });
    callback(movies);
  });
}
