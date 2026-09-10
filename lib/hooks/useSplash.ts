"use client";

// The launch splash video has been turned off. Stubbed here (rather than
// touching SplashProvider, SplashScreen, or AppReadyContext) so every
// consumer's contract stays exactly the same — contentReady flips true and
// showSplash stays false immediately, which is exactly the state they'd
// have ended up in once a real splash finished, just without ever showing
// one. splashOnce.ts's once-per-session claim is no longer called; nothing
// else imports it.
export function useSplash({ fadeMs = 300 }: { fadeMs?: number } = {}) {
  void fadeMs;
  return {
    showSplash: false,
    fadingOut: false,
    onVideoEnd: () => {},
    onFadeOutEnd: () => {},
    contentReady: true,
  };
}
