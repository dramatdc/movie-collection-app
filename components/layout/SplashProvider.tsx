"use client";

import { useSplash } from "@/lib/hooks/useSplash";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { AppReadyProvider } from "@/lib/context/AppReadyContext";

// Lives in the root layout, above routing, so it never remounts on
// navigation. `children` mounts as soon as contentReady flips (near-instant
// if the splash isn't showing this load, or after a brief head-start for
// the video if it is — see useSplash) so the destination route starts
// fetching its own data early, while this overlays the splash on top for
// its fixed duration. That way whatever's underneath has already had time
// to load by the time the splash fades, instead of only starting to load
// at that exact moment.
export function SplashProvider({ children }: { children: React.ReactNode }) {
  const { showSplash, fadingOut, onVideoEnd, onFadeOutEnd, contentReady } = useSplash();

  return (
    <>
      {contentReady && (
        <AppReadyProvider ready={!showSplash}>{children}</AppReadyProvider>
      )}
      {showSplash && (
        <SplashScreen fadingOut={fadingOut} onVideoEnd={onVideoEnd} onFadeOutEnd={onFadeOutEnd} />
      )}
    </>
  );
}
