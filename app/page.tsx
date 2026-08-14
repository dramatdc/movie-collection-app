"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSplash } from "@/lib/hooks/useSplash";
import { SplashScreen } from "@/components/layout/SplashScreen";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showSplash, fadingOut, onVideoEnd } = useSplash(!loading);

  useEffect(() => {
    // Wait for the splash video to actually finish too, not just auth —
    // otherwise an already-signed-in user (whose auth state resolves near
    // instantly from cache) redirects away and unmounts the splash within
    // milliseconds, long before the animation is ever visible.
    if (loading || showSplash) return;
    router.replace(user ? "/library" : "/login");
  }, [loading, showSplash, user, router]);

  if (showSplash) {
    return <SplashScreen fadingOut={fadingOut} onVideoEnd={onVideoEnd} />;
  }

  return null;
}
