import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./client";
import type { CustomList, CustomListItem } from "./types";

function listsCollection(uid: string) {
  return collection(db, "users", uid, "lists");
}

function listItemsCollection(uid: string, listId: string) {
  return collection(db, "users", uid, "lists", listId, "items");
}

export async function createList(uid: string, name: string) {
  const docRef = await addDoc(listsCollection(uid), {
    name,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function renameList(uid: string, listId: string, name: string) {
  await updateDoc(doc(listsCollection(uid), listId), { name });
}

export async function deleteList(uid: string, listId: string) {
  const itemsSnap = await getDocs(listItemsCollection(uid, listId));
  await Promise.all(itemsSnap.docs.map((d) => deleteDoc(d.ref)));
  await deleteDoc(doc(listsCollection(uid), listId));
}

export function subscribeToLists(
  uid: string,
  callback: (lists: CustomList[]) => void
) {
  return onSnapshot(listsCollection(uid), (snapshot) => {
    const lists = snapshot.docs.map((d) => {
      const data = d.data();
      const createdAt =
        data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now();
      return { id: d.id, name: data.name as string, createdAt } as CustomList;
    });
    callback(lists);
  });
}

export async function addItemToList(
  uid: string,
  listId: string,
  item: Omit<CustomListItem, "addedAt">
) {
  await setDoc(doc(listItemsCollection(uid, listId), String(item.tmdbId)), {
    ...item,
    addedAt: serverTimestamp(),
  });
}

export async function removeItemFromList(uid: string, listId: string, tmdbId: number) {
  await deleteDoc(doc(listItemsCollection(uid, listId), String(tmdbId)));
}

export function subscribeToListItems(
  uid: string,
  listId: string,
  callback: (items: CustomListItem[]) => void
) {
  return onSnapshot(listItemsCollection(uid, listId), (snapshot) => {
    const items = snapshot.docs.map((d) => {
      const data = d.data();
      const addedAt =
        data.addedAt instanceof Timestamp ? data.addedAt.toMillis() : Date.now();
      return { ...data, addedAt } as CustomListItem;
    });
    callback(items);
  });
}
