"use client";

import { useEffect } from "react";

// Full-screen modals sit on top visually but don't stop the page underneath
// from scrolling on its own — this locks it for as long as `locked` is true.
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}
