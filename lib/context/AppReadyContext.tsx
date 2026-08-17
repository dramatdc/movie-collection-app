"use client";

import { createContext, useContext } from "react";

const AppReadyContext = createContext(false);

// True once the launch splash is done. Anything that measures the page's
// layout (the tutorial's auto-start, most notably) needs to wait for this —
// the whole app now mounts concurrently with the splash so it can load
// behind it, which means the DOM is actively settling (data loading in,
// images arriving, the splash itself still covering/fading) for as long as
// the splash is up. Starting something layout-sensitive before this is
// true is racing against all of that.
export function AppReadyProvider({
  ready,
  children,
}: {
  ready: boolean;
  children: React.ReactNode;
}) {
  return <AppReadyContext.Provider value={ready}>{children}</AppReadyContext.Provider>;
}

export function useAppReady() {
  return useContext(AppReadyContext);
}
