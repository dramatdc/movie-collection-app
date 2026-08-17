"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppReady } from "@/lib/context/AppReadyContext";
import { useMovies } from "@/lib/hooks/useMovies";
import { hasSeenTutorial, markTutorialSeen } from "@/lib/firebase/tutorial";
import { isTutorialSeenLocally, markTutorialSeenLocally } from "./localFlag";
import { setCollectionViewMode } from "@/lib/preferences";
import { TUTORIAL_STEPS } from "./steps";

interface TutorialContextValue {
  active: boolean;
  stepIndex: number;
  step: (typeof TUTORIAL_STEPS)[number] | null;
  totalSteps: number;
  // For a requireAction step: whether the real control has actually been
  // pressed yet. False shows a "do this" hint instead of Next, so the user
  // can't skip past without trying it; true reveals a normal Next button so
  // they move on when they're ready, not the instant they've pressed it.
  actionDone: boolean;
  markActionDone: () => void;
  start: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const appReady = useAppReady();
  const { loading: moviesLoading } = useMovies();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [actionDone, setActionDone] = useState(false);
  const checkedRef = useRef<string | null>(null);

  // A fresh step never starts pre-completed, whether arrived at via Next,
  // Back, or a fresh start().
  useEffect(() => {
    setActionDone(false);
  }, [stepIndex, active]);

  // Auto-start once per session for any account that's never dismissed the
  // tour — covers brand-new signups and pre-existing accounts from before
  // this feature existed alike. checkedRef makes sure this only ever fires
  // once per uid per mount, so it can't pop up again mid-session even if
  // `user` changes reference without changing uid.
  //
  // Gated on appReady (the splash being fully done) AND movies having
  // loaded at least once — appReady alone isn't enough for the signup
  // case specifically: the splash plays and finishes on the login/signup
  // page itself, well before the account exists, so by the time /library
  // mounts for the first time right after signup, appReady is already
  // true and provides no protection at all. The actual race there is
  // /library mounting for the very first time against Firestore fetching
  // the (empty, for a brand-new account) movies collection, which is what
  // the library page's placeholder-movies UI depends on — so waiting for
  // that fetch to resolve, then a short settle delay for the resulting
  // render to actually paint, covers both races.
  useEffect(() => {
    if (!user || !appReady || moviesLoading || checkedRef.current === user.uid) return;
    checkedRef.current = user.uid;
    if (isTutorialSeenLocally(user.uid)) return;

    let cancelled = false;
    let settleId: ReturnType<typeof setTimeout> | undefined;

    hasSeenTutorial(user.uid).then((seen) => {
      if (cancelled) return;
      if (seen) {
        markTutorialSeenLocally(user.uid);
        return;
      }
      settleId = setTimeout(() => {
        if (!cancelled) {
          setStepIndex(0);
          setActive(true);
        }
      }, 500);
    });

    return () => {
      cancelled = true;
      clearTimeout(settleId);
    };
  }, [user, appReady, moviesLoading]);

  function start() {
    setStepIndex(0);
    setActive(true);
  }

  function dismiss() {
    setActive(false);
    // The view-toggle step makes the user actually flip the collection into
    // list view to demonstrate it — put it back the way they found it once
    // the tour is done, whether they finished or skipped partway through.
    setCollectionViewMode("card");
    if (user) {
      // Set the local flag synchronously first — the Firestore write below
      // is async and could still be in flight if the tab closes right after.
      markTutorialSeenLocally(user.uid);
      markTutorialSeen(user.uid);
    }
  }

  function next() {
    if (stepIndex >= TUTORIAL_STEPS.length - 1) {
      dismiss();
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function back() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function skip() {
    dismiss();
  }

  function markActionDone() {
    setActionDone(true);
  }

  const value: TutorialContextValue = {
    active,
    stepIndex,
    step: active ? TUTORIAL_STEPS[stepIndex] : null,
    totalSteps: TUTORIAL_STEPS.length,
    actionDone,
    markActionDone,
    start,
    next,
    back,
    skip,
  };

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}

export function useTutorial() {
  const ctx = useContext(TutorialContext);
  if (!ctx) throw new Error("useTutorial must be used within a TutorialProvider");
  return ctx;
}
