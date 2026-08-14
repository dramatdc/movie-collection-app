const STORAGE_KEY = "hardcopy:splash-shown";

let claimed = false;

/**
 * SplashProvider is the single, persistent owner of the splash (it lives in
 * the root layout and never remounts on navigation), so this just answers
 * "has it already played this session" once.
 *
 * Backed by sessionStorage rather than just the in-memory flag above —
 * on a phone especially, the webview can get torn down and its JS
 * re-evaluated (backgrounding, a stray full reload) without the tab/app
 * itself actually closing, which would otherwise reset a plain module
 * variable and replay the splash mid-session, e.g. right after tapping
 * into a movie. sessionStorage survives that and only clears on an
 * actual new session, matching "once per launch".
 */
export function claimSplash(): boolean {
  if (claimed) return false;

  try {
    if (sessionStorage.getItem(STORAGE_KEY)) {
      claimed = true;
      return false;
    }
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — fall back to
    // the in-memory flag, which still covers the common case.
  }

  claimed = true;
  return true;
}
