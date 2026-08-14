"use client";

import { useEffect, useRef } from "react";

export function SplashScreen({
  fadingOut = false,
  onVideoEnd,
}: {
  fadingOut?: boolean;
  onVideoEnd?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // React's `muted` JSX prop doesn't reliably survive hydration as a live
    // DOM property in every browser, and autoplay is only permitted when
    // that property (not just the HTML attribute) is actually true — so set
    // it imperatively and kick off playback ourselves rather than trusting
    // autoplay alone.
    video.muted = true;
    video.play().catch(() => {
      // Autoplay can still be blocked in some contexts — the dark splash
      // background still shows either way, and useSplash's own fallback
      // timer keeps things moving even if `ended` never fires because of
      // this.
    });
  }, []);

  // The video finishing is what actually drives the splash away (see
  // useSplash) — this is what guarantees it always plays start to finish
  // instead of being cut off by some fixed, guessed duration. `error` is
  // treated the same as `ended` so a decode failure can't strand the app on
  // the splash screen forever.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onVideoEnd) return;
    video.addEventListener("ended", onVideoEnd);
    video.addEventListener("error", onVideoEnd);
    return () => {
      video.removeEventListener("ended", onVideoEnd);
      video.removeEventListener("error", onVideoEnd);
    };
  }, [onVideoEnd]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-canvas transition-opacity duration-300 ease-out"
      style={{ opacity: fadingOut ? 0 : 1 }}
    >
      <video
        ref={videoRef}
        src="/brand/splash.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        className="h-full w-full max-w-md object-contain"
      />
    </div>
  );
}
