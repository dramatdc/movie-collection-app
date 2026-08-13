"use client";

import { subscribeToWishlist } from "@/lib/firebase/wishlist";
import type { WishlistItem } from "@/lib/firebase/types";
import { createSubscriptionHook } from "./createSubscription";

const useCached = createSubscriptionHook<WishlistItem[]>(subscribeToWishlist, []);

export function useWishlist() {
  const { data, loading } = useCached();
  return { items: data, loading };
}
