"use client";

import { useEffect, useState } from "react";
import { subscribeToListItems } from "@/lib/firebase/lists";
import type { CustomListItem } from "@/lib/firebase/types";
import { useAuth } from "./useAuth";

interface CacheEntry {
  data: CustomListItem[];
  loading: boolean;
  listeners: Set<(data: CustomListItem[], loading: boolean) => void>;
  unsubscribe: () => void;
}

// Same reasoning as createSubscription.ts's cache, but keyed by uid+listId
// together rather than uid alone — subscribeToListItems needs both to know
// which list to listen to. Without this, opening a list, navigating away,
// and coming back re-subscribed from scratch and showed an empty/loading
// grid for a moment even though the items had just been loaded; everything
// else on this page (and the rest of the app) survives navigation via a
// cached subscription and reappears instantly, so this makes list items
// behave the same way.
const cache = new Map<string, CacheEntry>();

export function useListItems(listId: string) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const key = uid && listId ? `${uid}:${listId}` : null;
  const initial = key ? cache.get(key) : undefined;
  const [items, setItems] = useState<CustomListItem[]>(initial?.data ?? []);
  const [loading, setLoading] = useState(initial ? initial.loading : true);

  useEffect(() => {
    if (!uid) {
      for (const entry of cache.values()) entry.unsubscribe();
      cache.clear();
      setItems([]);
      setLoading(false);
      return;
    }
    if (!listId) {
      setItems([]);
      setLoading(false);
      return;
    }

    const cacheKey = `${uid}:${listId}`;
    let entry = cache.get(cacheKey);
    if (!entry) {
      const listeners = new Set<(data: CustomListItem[], loading: boolean) => void>();
      const unsubscribe = subscribeToListItems(uid, listId, (newData) => {
        const e = cache.get(cacheKey);
        if (!e) return;
        e.data = newData;
        e.loading = false;
        e.listeners.forEach((l) => l(newData, false));
      });
      entry = { data: [], loading: true, listeners, unsubscribe };
      cache.set(cacheKey, entry);
    }

    const listener = (newData: CustomListItem[], newLoading: boolean) => {
      setItems(newData);
      setLoading(newLoading);
    };
    entry.listeners.add(listener);
    setItems(entry.data);
    setLoading(entry.loading);

    return () => {
      entry!.listeners.delete(listener);
    };
  }, [uid, listId]);

  return { items: user ? items : [], loading };
}
