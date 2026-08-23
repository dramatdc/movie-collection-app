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
      // Signed-out visitors land on /add rather than /login — searching for
      // a movie and scanning a barcode aren't account-based features (see
      // app/(app)/layout.tsx and app/(app)/add/page.tsx), and a native app
      // has no address bar for a reviewer (or a real user) to reach that on
      // their own if every route bounced straight to a login wall first.
      router.replace(user ? "/library" : "/add");
    });
  }, [loading, user, router]);

  return null;
}
