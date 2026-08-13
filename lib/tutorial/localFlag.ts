const PREFIX = "hardcopy-tutorial-seen-";

// A synchronous, same-device backstop for the Firestore tutorialSeenAt flag.
// Dismissing the tour sets this immediately, before the async Firestore
// write even resolves — so a slow or momentarily-failed write can never
// cause the tour to reappear on this device, even if it hasn't reached the
// server yet.
export function isTutorialSeenLocally(uid: string): boolean {
  try {
    return localStorage.getItem(PREFIX + uid) === "1";
  } catch {
    return false;
  }
}

export function markTutorialSeenLocally(uid: string) {
  try {
    localStorage.setItem(PREFIX + uid, "1");
  } catch {
    // Private browsing / storage disabled — the Firestore flag still covers it.
  }
}
