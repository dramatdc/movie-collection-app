"use client";

import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirects as soon as auth resolves rather than waiting for the splash
  // to finish — the splash (see SplashProvider) is a persistent overlay
  // that keeps covering the screen through this navigation regardless, so
  // the destination route gets to mount and start loading its data early
  // instead of only starting once the splash is already gone. Wrapped in
  // startTransition so mounting the whole destination tree (header, nav,
  // movie rails, etc. all at once) is low-priority, interruptible work
  // instead of one heavy synchronous commit competing with the splash's
  // video for the main thread right as it starts.
  useEffect(() => {
    if (loading) return;
    startTransition(() => {
      router.replace(user ? "/library" : "/login");
    });
  }, [loading, user, router]);

  return null;
}
