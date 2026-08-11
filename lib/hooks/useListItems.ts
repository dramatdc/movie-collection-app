"use client";

import { useEffect, useState } from "react";
import { subscribeToListItems } from "@/lib/firebase/lists";
import type { CustomListItem } from "@/lib/firebase/types";
import { useAuth } from "./useAuth";

export function useListItems(listId: string) {
  const { user } = useAuth();
  const [items, setItems] = useState<CustomListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !listId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeToListItems(user.uid, listId, (i) => {
      setItems(i);
      setLoading(false);
    });
  }, [user, listId]);

  return { items: user ? items : [], loading };
}
