"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/lib/icons";

// router.back() rather than a hardcoded href — these detail pages are
// reachable from a lot of different places (library grid, recently added,
// wishlist grid, trending rail, search results), and back should always
// return to wherever the user actually came from.
export function BackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  function handleBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Back"
      className="flex w-fit items-center gap-1 text-sm text-muted hover:text-accent"
    >
      <ChevronLeftIcon className="h-4 w-4" />
      Back
    </button>
  );
}
