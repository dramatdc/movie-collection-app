"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { hasSeenTutorial, markTutorialSeen } from "@/lib/firebase/tutorial";
import { isTutorialSeenLocally, markTutorialSeenLocally } from "./localFlag";
import { setCollectionViewMode } from "@/lib/preferences";
import { TUTORIAL_STEPS } from "./steps";

interface TutorialContextValue {
  active: boolean;
  stepIndex: number;
  step: (typeof TUTORIAL_STEPS)[number] | null;
  totalSteps: number;
  start: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const checkedRef = useRef<string | null>(null);

  // Auto-start once per session for any account that's never dismissed the
  // tour — covers brand-new signups and pre-existing accounts from before
  // this feature existed alike. checkedRef makes sure this only ever fires
  // once per uid per mount, so it can't pop up again mid-session even if
  // `user` changes reference without changing uid.
  useEffect(() => {
    if (!user || checkedRef.current === user.uid) return;
    checkedRef.current = user.uid;
    if (isTutorialSeenLocally(user.uid)) return;
    hasSeenTutorial(user.uid).then((seen) => {
      if (seen) {
        markTutorialSeenLocally(user.uid);
      } else {
        setStepIndex(0);
        setActive(true);
      }
    });
  }, [user]);

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

  const value: TutorialContextValue = {
    active,
    stepIndex,
    step: active ? TUTORIAL_STEPS[stepIndex] : null,
    totalSteps: TUTORIAL_STEPS.length,
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
