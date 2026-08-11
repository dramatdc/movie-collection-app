"use client";

import { useEffect, useState } from "react";
import { subscribeToWishlist } from "@/lib/firebase/wishlist";
import type { WishlistItem } from "@/lib/firebase/types";
import { useAuth } from "./useAuth";

export function useWishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeToWishlist(user.uid, (i) => {
      setItems(i);
      setLoading(false);
    });
  }, [user]);

  return { items: user ? items : [], loading };
}
