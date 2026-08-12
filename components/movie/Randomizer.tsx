"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb/image";
import { ShuffleIcon } from "@/lib/icons";
import type { OwnedMovie } from "@/lib/firebase/types";

const STRIDE = 108;
const STEP_TRANSITION_MS = 300;
const IDLE_INTERVAL_MS = 2400;
const MIN_SPIN_STEPS = 22;
const MIN_STEP_DELAY = 45;
const MAX_STEP_DELAY = 380;

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

  // Slow idle auto-advance, paused while spinning.
  useEffect(() => {
    if (spinning || eligible.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((i) => i + 1);
    }, IDLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [spinning, eligible.length]);

  useEffect(() => {
    return () => {
      if (spinTimer.current) clearTimeout(spinTimer.current);
    };
  }, []);

  function spin() {
    const length = eligible.length;
    if (length === 0 || spinning) return;

    const targetIdx = Math.floor(Math.random() * length);
    const currentMod = mod(index, length);
    const remainder = mod(targetIdx - currentMod, length);
    const extraLoops = Math.max(1, Math.ceil(MIN_SPIN_STEPS / length));
    const totalSteps = extraLoops * length + remainder;
    targetRef.current = eligible[targetIdx];

    setSpinning(true);
    let stepsDone = 0;

    function tick() {
      setIndex((i) => i + 1);
      stepsDone++;
      if (stepsDone >= totalSteps) {
        spinTimer.current = setTimeout(() => {
          setSpinning(false);
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
