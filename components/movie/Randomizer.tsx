"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb/image";
import { ShuffleIcon } from "@/lib/icons";
import { hapticImpact } from "@/lib/haptics";
import type { OwnedMovie } from "@/lib/firebase/types";

const STRIDE = 108;
const STEP_TRANSITION_MS = 280;
const IDLE_INTERVAL_MS = 2400;
// Fixed step count, independent of collection size, so a big library
// doesn't turn into a marathon spin.
const SPIN_STEPS_BASE = 15;
const SPIN_STEPS_JITTER = 5;
const MIN_STEP_DELAY = 45;
const MAX_STEP_DELAY = 320;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

// Eased delay curve for the spin: quick ticks at first, decelerating into
// the landing — a classic slot-machine feel.
function stepDelay(progress: number) {
  const eased = progress * progress;
  return MIN_STEP_DELAY + (MAX_STEP_DELAY - MIN_STEP_DELAY) * eased;
}

export function Randomizer({
  eligible,
  onLanded,
  disabled,
}: {
  eligible: OwnedMovie[];
  onLanded: (movie: OwnedMovie) => void;
  disabled?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  // Once a spin lands, the carousel stays put on the pick instead of
  // resuming the idle drift — until the tab is hidden and shown again.
  const [idleFrozen, setIdleFrozen] = useState(false);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetRef = useRef<OwnedMovie | null>(null);

  // Preload every eligible poster up front so a card never shows an empty
  // grey frame the first time it scrolls into view.
  useEffect(() => {
    eligible.forEach((m) => {
      const url = posterUrl(m.posterPath, "w342");
      if (!url) return;
      const img = new window.Image();
      img.src = url;
    });
  }, [eligible]);

  // Resume idle drift once the user leaves and comes back to the tab.
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        setIdleFrozen(false);
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Slow idle auto-advance, paused while spinning or while frozen on a pick.
  useEffect(() => {
    if (spinning || idleFrozen || eligible.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => i + 1);
    }, IDLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [spinning, idleFrozen, eligible.length]);

  useEffect(() => {
    return () => {
      if (spinTimer.current) clearTimeout(spinTimer.current);
    };
  }, []);

  function spin() {
    const length = eligible.length;
    if (length === 0 || spinning) return;

    // The landing card is chosen uniformly at random across every eligible
    // movie first — independent of where the reel currently sits — so every
    // title has an equal shot regardless of collection size or spin history.
    // The visual spin then just walks the reel there over a fixed number of
    // ticks (covering more index positions per tick for a far-away target),
    // purely for the slot-machine feel; it never changes which movie wins.
    const currentPos = mod(index, length);
    let targetIndex = Math.floor(Math.random() * length);
    if (length > 1 && targetIndex === currentPos) {
      targetIndex = mod(targetIndex + 1, length);
    }
    const distance = mod(targetIndex - currentPos, length) || length;
    targetRef.current = eligible[targetIndex];

    const totalSteps =
      SPIN_STEPS_BASE + Math.floor(Math.random() * (SPIN_STEPS_JITTER + 1));

    setSpinning(true);
    let stepsDone = 0;

    function tick() {
      hapticImpact();
      stepsDone++;
      const covered = Math.round((distance * stepsDone) / totalSteps);
      setIndex(currentPos + covered);
      if (stepsDone >= totalSteps) {
        spinTimer.current = setTimeout(() => {
          setSpinning(false);
          setIdleFrozen(true);
          if (targetRef.current) onLanded(targetRef.current);
        }, STEP_TRANSITION_MS);
        return;
      }
      spinTimer.current = setTimeout(tick, stepDelay(stepsDone / totalSteps));
    }

    spinTimer.current = setTimeout(tick, stepDelay(0));
  }

  const slots = eligible.length <= 1 ? [0] : [-2, -1, 0, 1, 2];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-[240px] w-full max-w-[340px] overflow-hidden">
        {eligible.length === 0 ? (
          <div className="absolute left-1/2 top-1/2 h-[220px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface-hover" />
        ) : (
          slots.map((k) => {
            const absPos = index + k;
            const movie = eligible[mod(absPos, eligible.length)];
            const poster = posterUrl(movie.posterPath, "w342");
            const isCenter = k === 0;
            const scale = isCenter ? 1 : Math.abs(k) === 1 ? 0.72 : 0.55;
            const opacity = isCenter ? 1 : Math.abs(k) === 1 ? 0.65 : 0;
            return (
              <div
                key={absPos}
                className="absolute left-1/2 top-1/2 h-[220px] w-[150px] overflow-hidden rounded-2xl bg-surface-hover"
                style={{
                  transform: `translate(-50%, -50%) translateX(${k * STRIDE}px) scale(${scale})`,
                  opacity,
                  zIndex: 10 - Math.abs(k),
                  transition: `transform ${STEP_TRANSITION_MS}ms ease-out, opacity ${STEP_TRANSITION_MS}ms ease-out`,
                  boxShadow: isCenter ? "0 20px 40px -10px rgba(0,0,0,0.6)" : undefined,
                  outline: isCenter ? "2px solid var(--color-accent)" : undefined,
                }}
              >
                {poster && (
                  <Image
                    src={poster}
                    alt={movie.title}
                    fill
                    sizes="150px"
                    priority={isCenter}
                    className="object-cover"
                  />
                )}
              </div>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={disabled || spinning || eligible.length === 0}
        className="flex items-center justify-center gap-2 rounded bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-50"
      >
        <ShuffleIcon className="h-4 w-4" />
        {spinning ? "Spinning..." : "Pick something"}
      </button>
    </div>
  );
}
