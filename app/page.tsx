"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useSplash } from "@/lib/hooks/useSplash";
import { SplashScreen } from "@/components/layout/SplashScreen";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showSplash, fadingOut } = useSplash(!loading);

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/library" : "/login");
  }, [loading, user, router]);

  if (showSplash) {
    return <SplashScreen fadingOut={fadingOut} />;
  }

  return null;
}
