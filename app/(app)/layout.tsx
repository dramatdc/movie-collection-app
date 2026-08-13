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

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showSplash, fadingOut } = useSplash(!loading, { minDisplayMs: 1950 });

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (showSplash) {
    return <SplashScreen fadingOut={fadingOut} />;
  }

  if (!user) {
    return null;
  }

  return (
    <ConfirmDialogProvider>
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 px-4 py-4 pb-36 md:px-6 md:py-6 md:pb-6">
          {children}
        </main>
        <BottomNav />
        <InstallPrompt />
      </div>
    </ConfirmDialogProvider>
  );
}
