"use client";

import { useEffect, useState } from "react";
import { subscribeToLists } from "@/lib/firebase/lists";
import type { CustomList } from "@/lib/firebase/types";
import { useAuth } from "./useAuth";

export function useLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<CustomList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeToLists(user.uid, (l) => {
      setLists(l);
      setLoading(false);
    });
  }, [user]);

  return { lists: user ? lists : [], loading };
}
