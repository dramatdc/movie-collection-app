"use client";

import { subscribeToLists } from "@/lib/firebase/lists";
import type { CustomList } from "@/lib/firebase/types";
import { createSubscriptionHook } from "./createSubscription";

const useCached = createSubscriptionHook<CustomList[]>(subscribeToLists, []);

export function useLists() {
  const { data, loading } = useCached();
  return { lists: data, loading };
}
