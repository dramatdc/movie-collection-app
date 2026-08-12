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
import { playAddedChime } from "@/lib/sound";
import type { WishlistItem } from "./types";

function wishlistCollection(uid: string) {
  return collection(db, "users", uid, "wishlist");
}

export async function addToWishlist(
  uid: string,
  item: Omit<WishlistItem, "addedAt">
) {
  await setDoc(doc(wishlistCollection(uid), String(item.tmdbId)), {
    ...item,
    addedAt: serverTimestamp(),
  });
  playAddedChime();
}

export async function removeFromWishlist(uid: string, tmdbId: number) {
  await deleteDoc(doc(wishlistCollection(uid), String(tmdbId)));
}

export function subscribeToWishlist(
  uid: string,
  callback: (items: WishlistItem[]) => void
) {
  return onSnapshot(wishlistCollection(uid), (snapshot) => {
    const items = snapshot.docs.map((d) => {
      const data = d.data();
      const addedAt =
        data.addedAt instanceof Timestamp ? data.addedAt.toMillis() : Date.now();
      return { ...data, addedAt } as WishlistItem;
    });
    callback(items);
  });
}
