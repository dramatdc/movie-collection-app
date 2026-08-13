import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { auth, db } from "./client";

const MOVIE_SUBCOLLECTION_NAMES = ["movies", "wishlist", "watchlist"] as const;

async function deleteCollection(first: string, ...rest: string[]) {
  const snap = await getDocs(collection(db, first, ...rest));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

/** Deletes every Firestore doc under /users/{uid} — owned movies, wishlist,
 * lists (and each list's items subcollection), settings, and the user doc
 * itself. Does not touch /upc_cache, which holds no personal data. */
export async function deleteAccountData(uid: string) {
  for (const name of MOVIE_SUBCOLLECTION_NAMES) {
    await deleteCollection("users", uid, name);
  }

  const listsSnap = await getDocs(collection(db, "users", uid, "lists"));
  for (const listDoc of listsSnap.docs) {
    await deleteCollection("users", uid, "lists", listDoc.id, "items");
  }
  await deleteCollection("users", uid, "lists");

  await deleteCollection("users", uid, "settings");

  const batch = writeBatch(db);
  batch.delete(doc(db, "users", uid));
  await batch.commit();
}

/** Deletes the signed-in user's data and their Firebase Auth account.
 * Throws with code "auth/requires-recent-login" if Firebase requires a
 * fresh sign-in before allowing account deletion — caller should prompt
 * the user to sign out/in again and retry. */
export async function deleteAccount(uid: string) {
  await deleteAccountData(uid);
  if (auth.currentUser) {
    await deleteUser(auth.currentUser);
  }
}
