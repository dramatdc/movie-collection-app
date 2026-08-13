import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./client";

// Whether this user has ever dismissed (finished or skipped) the tutorial —
// stored on their own user doc so it's consistent across devices, unlike a
// localStorage flag. Missing/false means "never seen it" — including
// accounts created before this field existed, which is fine: they get to
// see the tour too.
export async function hasSeenTutorial(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", uid));
  return Boolean(snap.data()?.tutorialSeenAt);
}

export function markTutorialSeen(uid: string) {
  return setDoc(doc(db, "users", uid), { tutorialSeenAt: serverTimestamp() }, { merge: true });
}
