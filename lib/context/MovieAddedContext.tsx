"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useTutorial } from "@/lib/tutorial/TutorialContext";
import { MovieAddedCard } from "@/components/movie/MovieAddedCard";
import type { ShareCardMovie } from "@/lib/shareCard";

const AUTO_DISMISS_MS = 5000;

// Shown only for the tutorial's demo of this feature — a real Firestore
// movie isn't needed to make the point, just something with a title for
// the card and Share button to demonstrate against.
const TUTORIAL_DEMO_MOVIE: ShareCardMovie = {
  title: "Sample Movie",
  year: 2020,
  format: "Blu-ray",
  posterPath: null,
};

interface MovieAddedContextValue {
  celebrate: (movie: ShareCardMovie) => void;
}

const MovieAddedContext = createContext<MovieAddedContextValue | null>(null);

export function useMovieAdded() {
  const ctx = useContext(MovieAddedContext);
  if (!ctx) throw new Error("useMovieAdded must be used within a MovieAddedProvider");
  return ctx;
}

export function MovieAddedProvider({ children }: { children: React.ReactNode }) {
  const tutorial = useTutorial();
  const [movie, setMovie] = useState<ShareCardMovie | null>(null);
  // True only while the tutorial's own demo is showing — suppresses the
  // auto-dismiss timer below so the card doesn't disappear out from under
  // the step explaining it.
  const [persistent, setPersistent] = useState(false);

  const celebrate = useCallback((m: ShareCardMovie) => {
    setMovie(m);
    setPersistent(false);
  }, []);

  function dismiss() {
    setMovie(null);
    setPersistent(false);
  }

  useEffect(() => {
    if (!movie || persistent) return;
    const timer = setTimeout(() => setMovie(null), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [movie, persistent]);

  // The tutorial step demoing this feature shows a real instance of the
  // card — not a mock — so the Share button it spotlights is the actual
  // button. TutorialOverlay's own interactive:false handling (see
  // lib/tutorial/steps.ts) is what keeps it non-clickable during the tour;
  // this effect is only responsible for showing/hiding it in step with the
  // tour itself.
  useEffect(() => {
    const isDemoStep = tutorial.active && tutorial.step?.id === "share-feature";
    if (isDemoStep) {
      setMovie(TUTORIAL_DEMO_MOVIE);
      setPersistent(true);
    } else if (persistent) {
      setMovie(null);
      setPersistent(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorial.active, tutorial.step]);

  return (
    <MovieAddedContext.Provider value={{ celebrate }}>
      {children}
      <MovieAddedCard movie={movie} onDismiss={dismiss} />
    </MovieAddedContext.Provider>
  );
}
