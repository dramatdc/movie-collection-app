"use client";

import { useEffect } from "react";

// Full-screen modals sit on top visually but don't stop the page underneath
// from scrolling on its own. Plain `overflow: hidden` on body doesn't
// reliably hold on iOS Safari / PWA webviews — touch-driven scrolling and
// rubber-band bounce can still move the page underneath even with it set.
// Pinning body to `position: fixed` at its current scroll offset is the
// standard cross-platform fix: it takes the page out of the document flow
// entirely, so there's nothing left for a touch to scroll.
export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
