"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { ConfirmDialogProvider } from "@/components/ui/ConfirmDialog";
import { FormatPickerProvider } from "@/components/ui/FormatPickerDialog";
import { TutorialProvider } from "@/lib/tutorial/TutorialContext";
import { TutorialOverlay } from "@/components/tutorial/TutorialOverlay";
import { MovieAddedProvider } from "@/lib/context/MovieAddedContext";

// /add (search by title, scan a barcode) is the one route in this shell
// that isn't account-based — signed-out visitors can freely search and
// scan, and only get asked to create an account at the point they try to
// actually save something (see app/(app)/add/page.tsx's promptSignup).
// Apple's Guideline 5.1.1(v) rejected the app for gating every single
// route behind sign-in, including features with no inherent need for one.
const PUBLIC_ROUTES = new Set(["/add"]);

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);

  useEffect(() => {
    if (loading || isPublicRoute) return;
    if (!user) {
      router.replace("/login");
    }
  }, [loading, user, isPublicRoute, router]);

  if (loading || (!user && !isPublicRoute)) {
    return null;
  }

  return (
    <ConfirmDialogProvider>
      <FormatPickerProvider>
        <TutorialProvider>
          <MovieAddedProvider>
            {/* h-dvh + overflow-hidden here (not on <body>, which stays a
                normal scrolling page for the auth routes) makes this its own
                fixed-height shell: header and nav are ordinary flex children
                that never move, and <main> is the *only* scrolling element.
                Previously the header/nav were position:fixed relative to a
                scrolling <body>, which is exactly the setup iOS WebKit's
                fixed-positioning bugs target — animated scrolls, viewport
                resizes, and layout shifts could all make them visibly detach
                from the bottom of the screen. An element that's never inside
                a scrolling context has nothing for that bug class to act on. */}
            <div className="flex h-dvh flex-col overflow-hidden bg-bar">
              <AppHeader />
              <main className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-6 md:py-6">
                {children}
              </main>
              <BottomNav />
              <InstallPrompt />
            </div>
          </MovieAddedProvider>
          <TutorialOverlay />
        </TutorialProvider>
      </FormatPickerProvider>
    </ConfirmDialogProvider>
  );
}
