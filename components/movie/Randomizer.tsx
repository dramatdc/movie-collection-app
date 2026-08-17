"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb/image";
import { ShuffleIcon } from "@/lib/icons";
import { hapticImpact } from "@/lib/haptics";
import type { OwnedMovie } from "@/lib/firebase/types";

const STRIDE = 108;
const IDLE_INTERVAL_MS = 2400;
const IDLE_TRANSITION_MS = 320;
const SPIN_DURATION_MS = 2600;
// The spin always covers at least this many single-card steps (padding out
// short hops with extra full laps) so it never feels like a token flick.
const MIN_SPIN_STEPS = 12;
// The very first spin (per tab visit) runs slower and covers more ground to
// actually build suspense — every spin after that uses the snappier pace
// above, until the tab is left and comes back, which resets it.
const FIRST_SPIN_DURATION_MS = 5200;
const FIRST_SPIN_MIN_STEPS = 30;
// Slots rendered on each side of center — kept small since the outer ones
// fade to fully transparent well before the edge, so new keyed elements
// entering the window are already invisible when they appear.
const HALF_WINDOW = 3;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

// Fast start, smooth deceleration to a dead stop — the reel "spins rapidly"
// early on and settles calmly into the landing rather than ticking down in
// discrete steps.
function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
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
  // A continuous position along the reel (not an integer tick count) — the
  // slot at the nearest whole number is "center". Driven every frame during
  // a spin so cards slide smoothly past a fixed center point instead of
  // popping between positions.
  const [reelPos, setReelPos] = useState(0);
  const reelPosRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  // Once a spin lands, the carousel stays put on the pick instead of
  // resuming the idle drift — until the tab is hidden and shown again.
  const [idleFrozen, setIdleFrozen] = useState(false);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef<OwnedMovie | null>(null);
  const lastHapticSlotRef = useRef(0);
  // True until the first spin of this tab visit lands, then false for every
  // spin after that — reset back to true when the tab is left and returned
  // to (see the visibility handler below), so it builds suspense again next
  // time rather than only on the very first ever spin.
  const firstSpinRef = useRef(true);
  // Randomizes which movies the reel opens on, once per mount — without
  // this it always starts centered on eligible[0], so the same few movies
  // showed up every time regardless of collection size.
  const startedRef = useRef(false);

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

  useEffect(() => {
    if (startedRef.current || eligible.length === 0) return;
    startedRef.current = true;
    const randomStart = Math.floor(Math.random() * eligible.length);
    reelPosRef.current = randomStart;
    setReelPos(randomStart);
  }, [eligible]);

  // Resume idle drift once the user leaves and comes back to the tab, and
  // treat the next spin after a return as the suspense-building "first" one
  // again.
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        setIdleFrozen(false);
      } else {
        firstSpinRef.current = true;
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Slow idle auto-advance, paused while spinning or while frozen on a pick.
  // A whole-step jump, but the card below eases into it via a CSS
  // transition rather than the frame-by-frame rAF driving used for spins.
  useEffect(() => {
    if (spinning || idleFrozen || eligible.length <= 1) return;
    const interval = setInterval(() => {
      const next = Math.round(reelPosRef.current) + 1;
      reelPosRef.current = next;
      setReelPos(next);
    }, IDLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [spinning, idleFrozen, eligible.length]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function spin() {
    const length = eligible.length;
    if (length === 0 || spinning) return;

    // The landing card is chosen uniformly at random across every OTHER
    // eligible movie — independent of where the reel currently sits — so
    // every title has an equal shot regardless of collection size or spin
    // history. Picking from [0, length) and bumping forward by one on a
    // collision with the current slot (the naive approach) sounds
    // equivalent but isn't: it makes the very next slot land twice as often
    // as any other, since it's reachable both directly and via the bump.
    // Picking the offset from the other length-1 slots instead keeps every
    // remaining title's odds identical.
    const startPos = Math.round(reelPosRef.current);
    const currentSlot = mod(startPos, length);
    const targetSlot =
      length > 1 ? mod(currentSlot + 1 + Math.floor(Math.random() * (length - 1)), length) : currentSlot;

    const isFirstSpin = firstSpinRef.current;
    const minSteps = isFirstSpin ? FIRST_SPIN_MIN_STEPS : MIN_SPIN_STEPS;
    const duration = isFirstSpin ? FIRST_SPIN_DURATION_MS : SPIN_DURATION_MS;

    let distance = mod(targetSlot - currentSlot, length) || length;
    while (distance < minSteps) distance += length;

    const targetPos = startPos + distance;
    targetRef.current = eligible[mod(targetPos, length)];

    setSpinning(true);
    firstSpinRef.current = false;
    lastHapticSlotRef.current = startPos;
    const startTime = performance.now();

    function frame(now: number) {
      const t = Math.min(1, (now - startTime) / duration);
      const pos = startPos + distance * easeOutQuint(t);
      reelPosRef.current = pos;
      setReelPos(pos);

      const nearestSlot = Math.round(pos);
      if (nearestSlot !== lastHapticSlotRef.current) {
        hapticImpact();
        lastHapticSlotRef.current = nearestSlot;
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      reelPosRef.current = targetPos;
      setReelPos(targetPos);
      setSpinning(false);
      setIdleFrozen(true);
      if (targetRef.current) onLanded(targetRef.current);
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  const centerSlot = Math.round(reelPos);
  const slots =
    eligible.length <= 1
      ? [centerSlot]
      : Array.from({ length: HALF_WINDOW * 2 + 1 }, (_, i) => centerSlot - HALF_WINDOW + i);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-[240px] w-full max-w-[340px] overflow-hidden">
        {eligible.length === 0 ? (
          <div className="absolute left-1/2 top-1/2 h-[220px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface-hover" />
        ) : (
          slots.map((absPos) => {
            const movie = eligible[mod(absPos, eligible.length)];
            const poster = posterUrl(movie.posterPath, "w342");
            const offset = absPos - reelPos;
            const dist = Math.abs(offset);
            const isCenter = dist < 0.5;
            const scale = dist < 0.5 ? 1 : dist < 1.5 ? 0.72 : 0.55;
            const opacity = dist < 0.5 ? 1 : dist < 1.5 ? 0.65 : Math.max(0, 1 - (dist - 1.5));
            return (
              <div
                key={absPos}
                className="absolute left-1/2 top-1/2 h-[220px] w-[150px] overflow-hidden rounded-2xl bg-surface-hover"
                style={{
                  transform: `translate(-50%, -50%) translateX(${offset * STRIDE}px) scale(${scale})`,
                  opacity,
                  zIndex: 10 - Math.round(dist),
                  transition: spinning
                    ? "none"
                    : `transform ${IDLE_TRANSITION_MS}ms ease-out, opacity ${IDLE_TRANSITION_MS}ms ease-out`,
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
