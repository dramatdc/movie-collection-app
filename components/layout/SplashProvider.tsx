"use client";

import { useSplash } from "@/lib/hooks/useSplash";
import { SplashScreen } from "@/components/layout/SplashScreen";

// Lives in the root layout, above routing, so it never remounts on
// navigation. `children` renders immediately and unconditionally — the
// destination route mounts and starts fetching its own data right away —
// while this just overlays the splash on top for its fixed duration. That
// way whatever's underneath has already had time to load by the time the
// splash fades, instead of only starting to load at that exact moment.
export function SplashProvider({ children }: { children: React.ReactNode }) {
  const { showSplash, fadingOut, onVideoEnd } = useSplash();

  return (
    <>
      {children}
      {showSplash && <SplashScreen fadingOut={fadingOut} onVideoEnd={onVideoEnd} />}
    </>
  );
}
