"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
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
  const router = useRouter();

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
  );
}
