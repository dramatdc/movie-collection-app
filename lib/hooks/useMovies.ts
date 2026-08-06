"use client";

import { useEffect, useState } from "react";
import { subscribeToMovies } from "@/lib/firebase/firestore";
import type { OwnedMovie } from "@/lib/firebase/types";
import { useAuth } from "./useAuth";

export function useMovies() {
  const { user } = useAuth();
  const [movies, setMovies] = useState<OwnedMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    return subscribeToMovies(user.uid, (m) => {
      setMovies(m);
      setLoading(false);
    });
  }, [user]);

  return { movies: user ? movies : [], loading };
}
