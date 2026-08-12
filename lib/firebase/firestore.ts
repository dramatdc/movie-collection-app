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
import { playAddedChime } from "@/lib/sound";
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
  playAddedChime();
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
