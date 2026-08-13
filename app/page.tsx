"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSplash } from "@/lib/hooks/useSplash";
import { SplashScreen } from "@/components/layout/SplashScreen";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showSplash, fadingOut } = useSplash(!loading, { minDisplayMs: 1950 });

  useEffect(() => {
    // Wait for the splash's own minimum-display floor too, not just auth —
    // otherwise an already-signed-in user (whose auth state resolves near
    // instantly from cache) redirects away and unmounts the splash within
    // milliseconds, long before the animation is ever visible.
    if (loading || showSplash) return;
    router.replace(user ? "/library" : "/login");
  }, [loading, showSplash, user, router]);

  if (showSplash) {
    return <SplashScreen fadingOut={fadingOut} />;
  }

  return null;
}
