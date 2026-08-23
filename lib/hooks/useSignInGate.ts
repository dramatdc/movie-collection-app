"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { useConfirm } from "@/components/ui/ConfirmDialog";

// Nav links to account-based routes (Library, Wishlist, Lists, Picker,
// Profile) used to just silently bounce a signed-out visitor to /login the
// moment they tapped one — jarring, and gives no chance to keep exploring
// the one route that doesn't need an account (/add). This intercepts the
// click instead, explains what the tab needs an account for, and lets them
// back out and stay put if they'd rather keep browsing first.
export function useSignInGate() {
  const { user } = useAuth();
  const router = useRouter();
  const confirmDialog = useConfirm();

  return function guardNav(label: string) {
    return async (e: React.MouseEvent) => {
      if (user) return;
      e.preventDefault();
      const confirmed = await confirmDialog({
        title: "Create a free account",
        message: `You'll need a free account to use ${label} — it's free and takes a few seconds. You can keep exploring first if you'd rather.`,
        confirmLabel: "Sign up",
        cancelLabel: "Keep exploring",
      });
      if (confirmed) router.push("/signup");
    };
  };
}
