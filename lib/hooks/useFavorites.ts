"use client";

import { subscribeToFavorites } from "@/lib/firebase/favorites";
import type { FavoriteMovie } from "@/lib/firebase/types";
import { createSubscriptionHook } from "./createSubscription";

const useCached = createSubscriptionHook<FavoriteMovie[]>(subscribeToFavorites, []);

export function useFavorites() {
  const { data, loading } = useCached();
  return { favorites: data, loading };
}
