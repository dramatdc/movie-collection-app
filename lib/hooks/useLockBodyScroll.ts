"use client";

import { useEffect } from "react";

// Full-screen modals sit on top visually but don't stop the page underneath
// from scrolling on its own. The app shell's actual scrolling element is
// <main> (see app/(app)/layout.tsx) — <body> itself no longer scrolls there,
// so locking <body> (the old approach) was locking the wrong element and had
// no visible effect. Plain overflow:hidden is unreliable specifically for
// document-level (body/html) scroll on iOS, which is why that old approach
// needed the position:fixed pinning trick — but for an ordinary overflow:auto
// element like <main>, plain overflow:hidden reliably stops touch scrolling.
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const scrollEl = document.querySelector<HTMLElement>("main") ?? document.body;
    const previousOverflow = scrollEl.style.overflow;
    scrollEl.style.overflow = "hidden";

    return () => {
      scrollEl.style.overflow = previousOverflow;
    };
  }, [locked]);
}
