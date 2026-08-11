"use client";

import { useCallback, useEffect, useState } from "react";

const MAX_RECENT = 4;

export function useRecentSearches(storageKey: string) {
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      // ignore malformed/unavailable storage
    }
  }, [storageKey]);

  const record = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      setRecent((prev) => {
        const next = [
          trimmed,
          ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
        ].slice(0, MAX_RECENT);
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // ignore storage write failures
        }
        return next;
      });
    },
    [storageKey]
  );

  return { recent, record };
}
