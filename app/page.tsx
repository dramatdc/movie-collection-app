"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/library" : "/login");
  }, [loading, user, router]);

  return (
    <div className="flex flex-1 items-center justify-center text-muted text-sm">
      Loading...
    </div>
  );
}
