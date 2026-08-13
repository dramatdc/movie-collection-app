"use client";

import { subscribeToWatchlist } from "@/lib/firebase/watchlist";
import type { WatchlistItem } from "@/lib/firebase/types";
import { createSubscriptionHook } from "./createSubscription";

const useCached = createSubscriptionHook<WatchlistItem[]>(subscribeToWatchlist, []);

export function useWatchlist() {
  const { data, loading } = useCached();
  return { items: data, loading };
}
