"use client";

import { useEffect, useState } from "react";
import { subscribeToWatchlist } from "@/lib/firebase/watchlist";
import type { WatchlistItem } from "@/lib/firebase/types";
import { useAuth } from "./useAuth";

export function useWatchlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeToWatchlist(user.uid, (i) => {
      setItems(i);
      setLoading(false);
    });
  }, [user]);

  return { items: user ? items : [], loading };
}
