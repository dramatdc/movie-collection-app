"use client";

import { useCallback, useEffect, useState } from "react";
import { claimSplash } from "./splashOnce";

// Absolute upper bound in case the video is blocked from autoplaying or
// never fires `ended` for some other reason — without this, a playback
// failure would leave the splash on screen forever instead of just
// skipping it. Comfortably longer than the video itself so it never fires
// in the normal case.
const MAX_DISPLAY_MS = 6000;

/**
 * Shows the splash only for whichever loading gate mounts first this
 * session (see splashOnce.ts), keeping it up until the splash video has
 * actually finished playing — never cut short, regardless of how long the
 * video runs — then holding it a bit longer after `ready` flips true so the
 * caller can fade it out instead of swapping straight to real content.
 */
export function useSplash(ready: boolean, { fadeMs = 350 }: { fadeMs?: number } = {}) {
  const [enabled, setEnabled] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

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
    const timer = setTimeout(() => setVideoEnded(true), MAX_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !ready || !videoEnded) return;
    setFadingOut(true);
  }, [enabled, ready, videoEnded]);

  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(() => setShowSplash(false), fadeMs);
    return () => clearTimeout(timer);
  }, [fadingOut, fadeMs]);

  const onVideoEnd = useCallback(() => setVideoEnded(true), []);

  return { showSplash, fadingOut, onVideoEnd };
}
