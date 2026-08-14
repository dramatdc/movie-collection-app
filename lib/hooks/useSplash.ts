"use client";

import { useCallback, useEffect, useState } from "react";
import { claimSplash } from "./splashOnce";

// The whole splash, fade included, must never take longer than this —
// however long the video file itself runs, or however slow auth is to
// resolve. Not a "usually" — a hard cap for every device every time.
const TOTAL_DISPLAY_MS = 3000;

/**
 * Shows the splash only for whichever loading gate mounts first this
 * session (see splashOnce.ts). Fades out as soon as the splash video
 * finishes — or after TOTAL_DISPLAY_MS minus the fade time, whichever
 * comes first — so a short video gets to play naturally while a longer (or
 * stalled) one never holds the splash past the 3-second budget.
 */
export function useSplash({ fadeMs = 300 }: { fadeMs?: number } = {}) {
  const [enabled, setEnabled] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [done, setDone] = useState(false);

  // The claim touches shared module state, so it can only run client-side,
  // after hydration — doing it during render (e.g. as a useState initializer)
  // runs it during SSR/static generation too and under React's dev-mode
  // double-invocation, both of which produced a real hydration mismatch here
  // since the server and client ended up disagreeing about who "won".
  useEffect(() => {
    if (!claimSplash()) {
      setEnabled(false);
      setShowSplash(false);
    }
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

  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(() => setShowSplash(false), fadeMs);
    return () => clearTimeout(timer);
  }, [fadingOut, fadeMs]);

  const onVideoEnd = useCallback(() => setDone(true), []);

  return { showSplash, fadingOut, onVideoEnd };
}
