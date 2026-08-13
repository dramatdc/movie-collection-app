"use client";

import { useEffect, useState } from "react";
import { claimSplash } from "./splashOnce";

/**
 * Shows the splash only for whichever loading gate mounts first this
 * session (see splashOnce.ts), keeping it up for at least `minDisplayMs` so
 * a branded animation isn't cut off if auth resolves instantly, then holding
 * it a bit longer after `ready` flips true so the caller can fade it out
 * instead of swapping straight to real content.
 */
export function useSplash(
  ready: boolean,
  { fadeMs = 350, minDisplayMs = 0 }: { fadeMs?: number; minDisplayMs?: number } = {}
) {
  const [enabled, setEnabled] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);
  const [mountedAt] = useState(() => Date.now());

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
    if (!enabled || !ready) return;
    const elapsed = Date.now() - mountedAt;
    const remaining = Math.max(0, minDisplayMs - elapsed);
    const timer = setTimeout(() => setFadingOut(true), remaining);
    return () => clearTimeout(timer);
  }, [enabled, ready, minDisplayMs, mountedAt]);

  useEffect(() => {
    if (!fadingOut) return;
    const timer = setTimeout(() => setShowSplash(false), fadeMs);
    return () => clearTimeout(timer);
  }, [fadingOut, fadeMs]);

  return { showSplash, fadingOut };
}
