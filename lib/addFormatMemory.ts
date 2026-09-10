import type { MovieFormat } from "./firebase/types";

const STORAGE_KEY = "hardcopy:default-add-format";

// Lets someone adding a stack of the same edition (e.g. "these are all
// Blu-rays") skip the format picker after the first pick. Backed by
// sessionStorage, not localStorage, so it clears automatically the next
// time the app is actually reopened rather than sticking around
// permanently — same mechanism and reasoning as the once-per-session splash
// claim in lib/hooks/splashOnce.ts.
export function getRememberedFormat(): MovieFormat | null {
  try {
    return (sessionStorage.getItem(STORAGE_KEY) as MovieFormat | null) ?? null;
  } catch {
    return null;
  }
}

export function setRememberedFormat(format: MovieFormat) {
  try {
    sessionStorage.setItem(STORAGE_KEY, format);
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — the picker
    // just shows every time instead, which is a safe fallback.
  }
}
