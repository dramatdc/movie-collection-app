"use client";

import { subscribeToMovies } from "@/lib/firebase/firestore";
import type { OwnedMovie } from "@/lib/firebase/types";
import { createSubscriptionHook } from "./createSubscription";

const useCached = createSubscriptionHook<OwnedMovie[]>(subscribeToMovies, []);

export function useMovies() {
  const { data, loading } = useCached();
  return { movies: data, loading };
}
