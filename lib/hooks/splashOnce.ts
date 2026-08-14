const STORAGE_KEY = "hardcopy:splash-shown";

let claimed = false;

/**
 * The app has two loading gates (the root redirect page, and the
 * authenticated shell it redirects into) that would otherwise each show
 * their own splash back to back on a fresh launch. Whichever one mounts
 * first claims the splash for this page-load session; the other sees it's
 * already been shown and skips straight through instead of playing it twice.
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
