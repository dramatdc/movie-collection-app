"use client";

import { useEffect, useState } from "react";

/**
 * Keeps the splash screen mounted briefly after `ready` flips true, so the
 * caller can fade it out instead of swapping straight to real content.
 */
export function useSplash(ready: boolean, fadeMs = 350) {
  const [showSplash, setShowSplash] = useState(true);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    if (!ready) return;
    setFadingOut(true);
    const timer = setTimeout(() => setShowSplash(false), fadeMs);
    return () => clearTimeout(timer);
  }, [ready, fadeMs]);

  return { showSplash, fadingOut };
}
