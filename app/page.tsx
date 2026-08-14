"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirects as soon as auth resolves rather than waiting for the splash
  // to finish — the splash (see SplashProvider) is a persistent overlay
  // that keeps covering the screen through this navigation regardless, so
  // the destination route gets to mount and start loading its data early
  // instead of only starting once the splash is already gone.
  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/library" : "/login");
  }, [loading, user, router]);

  return null;
}
