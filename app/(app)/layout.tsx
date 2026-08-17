"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMovies } from "@/lib/hooks/useMovies";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { ConfirmDialogProvider } from "@/components/ui/ConfirmDialog";
import { TutorialProvider } from "@/lib/tutorial/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { MovieAddedProvider } from "@/lib/context/MovieAddedContext";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { loading: moviesLoading } = useMovies();
  const router = useRouter();
  // Covers the shell's very first mount until it's had a moment to settle
  // — separate from (and in addition to) the once-per-session launch
  // splash. Signing up never shows that splash a second time (it already
  // played and finished on the login/signup screen itself, before the
  // account even existed), so the app shell mounting for the first time
  // right after signup was doing so with nothing covering it — every bit
  // of initial layout settling (the bottom nav, the tutorial spotlight)
  // was fully visible instead of hidden the way it is on a cold boot. This
  // makes that settling window consistently invisible either way, rather
  // than depending on whether the video splash happened to still be up.
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (loading || !user || moviesLoading || settled) return;
    const id = setTimeout(() => setSettled(true), 500);
    return () => clearTimeout(id);
  }, [loading, user, moviesLoading, settled]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <>
      <ConfirmDialogProvider>
        <TutorialProvider>
          <MovieAddedProvider>
            <div className="flex flex-1 flex-col">
              <AppHeader />
              <main className="flex-1 px-4 py-4 pb-36 md:px-6 md:py-6 md:pb-6">
                {children}
              </main>
              <BottomNav />
              <InstallPrompt />
            </div>
          </MovieAddedProvider>
          <TutorialOverlay />
        </TutorialProvider>
      </ConfirmDialogProvider>
      {!settled && <div className="fixed inset-0 z-[200] bg-canvas" />}
    </>
  );
}
