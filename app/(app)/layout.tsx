"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSplash } from "@/lib/hooks/useSplash";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { ConfirmDialogProvider } from "@/components/ui/ConfirmDialog";
import { TutorialProvider } from "@/lib/tutorial/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showSplash, fadingOut, onVideoEnd } = useSplash(!loading);

  useEffect(() => {
    // Wait for the splash video to actually finish too — see the same fix
    // in app/page.tsx for why this can't key off `loading` alone.
    if (loading || showSplash) return;
    if (!user) {
      router.replace("/login");
    }
  }, [loading, showSplash, user, router]);

  if (showSplash) {
    return <SplashScreen fadingOut={fadingOut} onVideoEnd={onVideoEnd} />;
  }

  if (!user) {
    return null;
  }

  return (
    <ConfirmDialogProvider>
      <TutorialProvider>
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 px-4 py-4 pb-36 md:px-6 md:py-6 md:pb-6">
            {children}
          </main>
          <BottomNav />
          <InstallPrompt />
        </div>
        <TutorialOverlay />
      </TutorialProvider>
    </ConfirmDialogProvider>
  );
}
