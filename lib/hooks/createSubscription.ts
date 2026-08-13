"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";

interface CacheEntry<T> {
  data: T;
  loading: boolean;
  listeners: Set<(data: T, loading: boolean) => void>;
  unsubscribe: () => void;
}

/**
 * Wraps a Firestore onSnapshot subscription in a module-level cache keyed by
 * uid, shared across every component using the resulting hook. Without this,
 * navigating away from a tab and back unmounts/remounts the hook, which reset
 * to a blank "loading" state and re-subscribed from scratch every time — a
 * visible flash of empty rails/lists even though the data had just been
 * loaded seconds earlier. Now the listener (and its last known data) survive
 * navigation, and only tear down when the user signs out.
 */
export function createSubscriptionHook<T>(
  subscribeFn: (uid: string, cb: (data: T) => void) => () => void,
  emptyValue: T
) {
  const cache = new Map<string, CacheEntry<T>>();

  return function useCachedSubscription() {
    const { user } = useAuth();
    const uid = user?.uid ?? null;
    const initial = uid ? cache.get(uid) : undefined;
    const [data, setData] = useState<T>(initial?.data ?? emptyValue);
    const [loading, setLoading] = useState<boolean>(initial ? initial.loading : true);

    useEffect(() => {
      if (!uid) {
        for (const entry of cache.values()) entry.unsubscribe();
        cache.clear();
        setData(emptyValue);
        setLoading(false);
        return;
      }

      let entry = cache.get(uid);
      if (!entry) {
        const listeners = new Set<(data: T, loading: boolean) => void>();
        const unsubscribe = subscribeFn(uid, (newData) => {
          const e = cache.get(uid!);
          if (!e) return;
          e.data = newData;
          e.loading = false;
          e.listeners.forEach((l) => l(newData, false));
        });
        entry = { data: emptyValue, loading: true, listeners, unsubscribe };
        cache.set(uid, entry);
      }

      const listener = (newData: T, newLoading: boolean) => {
        setData(newData);
        setLoading(newLoading);
      };
      entry.listeners.add(listener);
      setData(entry.data);
      setLoading(entry.loading);

      return () => {
        entry!.listeners.delete(listener);
      };
    }, [uid]);

    return { data, loading };
  };
}
