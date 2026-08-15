"use client";

import { useCallback, useEffect, useState } from "react";
import { claimSplash } from "./splashOnce";

// The whole splash, fade included, must never take longer than this —
// however long the video file itself runs, or however slow auth is to
// resolve. Not a "usually" — a hard cap for every device every time.
const TOTAL_DISPLAY_MS = 3000;

// How long SplashProvider holds off mounting the rest of the app once the
// splash is actually going to play. Mounting the whole destination route
// (header, nav, movie rails, Firestore subscriptions) is real work, and
// giving the video this short head start before any of that competes for
// the main thread is what keeps its first frames from stuttering. Skipped
// entirely when the splash isn't showing this load (see contentReady below)
// so it never taxes the common "already shown this session" case.
const CONTENT_DELAY_MS = 150;

/**
 * Shows the splash once per session (see splashOnce.ts). Fades out as soon
 * as the splash video finishes — or after TOTAL_DISPLAY_MS minus the fade
 * time, whichever comes first — so a short video gets to play naturally
 * while a longer (or stalled) one never holds the splash past the
 * 3-second budget.
 */
export function useSplash({ fadeMs = 300 }: { fadeMs?: number } = {}) {
  const [enabled, setEnabled] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [done, setDone] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  // The claim touches shared module state, so it can only run client-side,
  // after hydration — doing it during render (e.g. as a useState initializer)
  // runs it during SSR/static generation too and under React's dev-mode
  // double-invocation, both of which produced a real hydration mismatch here
  // since the server and client ended up disagreeing about who "won".
  useEffect(() => {
    if (!claimSplash()) {
      setEnabled(false);
      setShowSplash(false);
      setContentReady(true);
      return;
    }
    const timer = setTimeout(() => setContentReady(true), CONTENT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const timer = setTimeout(() => setDone(true), Math.max(0, TOTAL_DISPLAY_MS - fadeMs));
    return () => clearTimeout(timer);
  }, [enabled, fadeMs]);

  useEffect(() => {
    if (!enabled || !done) return;
    setFadingOut(true);
  }, [enabled, done]);

  // Dismissal is driven by the CSS opacity transition actually finishing
  // (see SplashScreen's onTransitionEnd), not a parallel setTimeout — a
  // timer that merely matches fadeMs can fire a beat before or after the
  // real fade paints, and the gap shows up as a visible pop instead of a
  // smooth reveal of the (now fully-loaded) page underneath. This timer is
  // just a safety net in case the transition event never fires for some
  // reason (e.g. a backgrounded tab).
  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(() => setShowSplash(false), fadeMs + 200);
    return () => clearTimeout(timer);
  }, [fadingOut, fadeMs]);

  const onVideoEnd = useCallback(() => setDone(true), []);
  const onFadeOutEnd = useCallback(() => setShowSplash(false), []);

  return { showSplash, fadingOut, onVideoEnd, onFadeOutEnd, contentReady };
}
