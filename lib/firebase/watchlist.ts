import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./client";
import type { WatchlistItem } from "./types";

function watchlistCollection(uid: string) {
  return collection(db, "users", uid, "watchlist");
}

export async function addToWatchlist(
  uid: string,
  item: Omit<WatchlistItem, "addedAt">
) {
  await setDoc(doc(watchlistCollection(uid), String(item.tmdbId)), {
    ...item,
    addedAt: serverTimestamp(),
  });
}

export async function removeFromWatchlist(uid: string, tmdbId: number) {
  await deleteDoc(doc(watchlistCollection(uid), String(tmdbId)));
}

export function subscribeToWatchlist(
  uid: string,
  callback: (items: WatchlistItem[]) => void
) {
  return onSnapshot(watchlistCollection(uid), (snapshot) => {
    const items = snapshot.docs.map((d) => {
      const data = d.data();
      const addedAt =
        data.addedAt instanceof Timestamp ? data.addedAt.toMillis() : Date.now();
      return { ...data, addedAt } as WatchlistItem;
    });
    callback(items);
  });
}
