let claimed = false;

/**
 * The app has two loading gates (the root redirect page, and the
 * authenticated shell it redirects into) that would otherwise each show
 * their own splash back to back on a fresh launch. Whichever one mounts
 * first claims the splash for this page-load session; the other sees it's
 * already been shown and skips straight through instead of playing it twice.
 */
export function claimSplash(): boolean {
  if (claimed) return false;
  claimed = true;
  return true;
}
