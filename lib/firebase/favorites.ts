import { doc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "./client";
import type { FavoriteMovie } from "./types";

export const MAX_FAVORITES = 4;

function userDoc(uid: string) {
  return doc(db, "users", uid);
}

// Favorites live as a small capped array directly on the user doc — with a
// hard limit of 4, a subcollection would be overkill. Uses Firestore's
// atomic arrayUnion/arrayRemove (not a read-then-write of the whole array)
// so two adds firing close together can't clobber each other.
export async function addFavorite(uid: string, movie: FavoriteMovie) {
  await updateDoc(userDoc(uid), { favorites: arrayUnion(movie) });
}

export async function removeFavorite(uid: string, movie: FavoriteMovie) {
  await updateDoc(userDoc(uid), { favorites: arrayRemove(movie) });
}

export function subscribeToFavorites(
  uid: string,
  callback: (favorites: FavoriteMovie[]) => void
) {
  return onSnapshot(userDoc(uid), (snap) => {
    const data = snap.data();
    callback((data?.favorites as FavoriteMovie[] | undefined) ?? []);
  });
}
