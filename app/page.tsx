"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSplash } from "@/lib/hooks/useSplash";
import { SplashScreen } from "@/components/layout/SplashScreen";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showSplash, fadingOut, onVideoEnd } = useSplash();

  useEffect(() => {
    // The splash has its own fixed 3-second budget regardless of auth — if
    // auth is still resolving once it's done, this just waits the extra
    // moment for `loading` to flip rather than redirecting too early.
    if (loading || showSplash) return;
    router.replace(user ? "/library" : "/login");
  }, [loading, showSplash, user, router]);

  if (showSplash) {
    return <SplashScreen fadingOut={fadingOut} onVideoEnd={onVideoEnd} />;
  }

  return null;
}
