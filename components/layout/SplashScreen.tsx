"use client";

import { useEffect, useRef } from "react";

export function SplashScreen({ fadingOut = false }: { fadingOut?: boolean }) {
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
      // background still shows either way, so this is a silent no-op.
    });
  }, []);

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
