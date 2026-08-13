"use client";

import { useEffect, useState } from "react";
import { subscribeToFavorites } from "@/lib/firebase/favorites";
import type { FavoriteMovie } from "@/lib/firebase/types";
import { useAuth } from "./useAuth";

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeToFavorites(user.uid, (f) => {
      setFavorites(f);
      setLoading(false);
    });
  }, [user]);

  return { favorites: user ? favorites : [], loading };
}
