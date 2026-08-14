import { doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { db } from "./client";

// Opaque enough to not be guessable by brute force, short enough to paste
// into a text message without it wrapping awkwardly.
function randomShareId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 18);
}

export interface ShareState {
  shareId: string | null;
  shareEnabled: boolean;
}

export async function getShareState(uid: string): Promise<ShareState> {
  const snap = await getDoc(doc(db, "users", uid));
  const data = snap.data();
  return {
    shareId: (data?.shareId as string | undefined) ?? null,
    shareEnabled: (data?.shareEnabled as boolean | undefined) ?? false,
  };
}

// Reuses the existing shareId if there is one (so a link already handed out
// keeps working when sharing is turned back on) — only mints a fresh one the
// very first time a user turns sharing on.
export async function enableSharing(uid: string, existingShareId: string | null) {
  const shareId = existingShareId ?? randomShareId();
  if (!existingShareId) {
    await setDoc(doc(db, "shareLinks", shareId), { uid, createdAt: Date.now() });
  }
  await updateDoc(doc(db, "users", uid), { shareId, shareEnabled: true });
  return shareId;
}

// Turning sharing off doesn't delete the link — the movies read rule checks
// shareEnabled on every request, so this alone immediately cuts off every
// copy of the link anyone was handed. Leaves it ready to flip back on later
// without generating (and having to redistribute) a new URL.
export async function disableSharing(uid: string) {
  await updateDoc(doc(db, "users", uid), { shareEnabled: false });
}

// Unlike disableSharing, this actually invalidates the old URL — mints a
// new id/link and removes the old mapping, for when a link was shared with
// the wrong person and needs to stop working outright.
export async function regenerateShareLink(uid: string, oldShareId: string | null) {
  const shareId = randomShareId();
  await setDoc(doc(db, "shareLinks", shareId), { uid, createdAt: Date.now() });
  await updateDoc(doc(db, "users", uid), { shareId, shareEnabled: true });
  if (oldShareId) {
    await deleteDoc(doc(db, "shareLinks", oldShareId)).catch(() => {});
  }
  return shareId;
}
