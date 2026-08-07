"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { posterUrl } from "@/lib/tmdb/image";
import { ShuffleIcon } from "@/lib/icons";
import type { OwnedMovie } from "@/lib/firebase/types";

const CARD_WIDTH = 260;
const GAP = 16;
const STRIDE = CARD_WIDTH + GAP;
const LOOPS = 5;
const SPIN_MS = 3200;

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
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
  const [reel, setReel] = useState<OwnedMovie[]>([]);
  const [offset, setOffset] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const targetRef = useRef<OwnedMovie | null>(null);
  const landedRef = useRef(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function land() {
    if (landedRef.current) return;
    landedRef.current = true;
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    setSpinning(false);
    if (targetRef.current) onLanded(targetRef.current);
  }

  function spin() {
    if (eligible.length === 0 || spinning) return;
    const target = eligible[Math.floor(Math.random() * eligible.length)];
    targetRef.current = target;
    landedRef.current = false;

    const built: OwnedMovie[] = [];
    for (let i = 0; i < LOOPS; i++) built.push(...shuffled(eligible));
    built.push(target);

    setSpinning(true);
    setAnimate(false);
    setReel(built);
    setOffset(0);

    // setTimeout (not rAF) so the 0-offset reliably paints before the
    // transition to the target offset is applied — rAF can stall while a
    // PWA tab is backgrounded, which a timer doesn't depend on.
    setTimeout(() => {
      setAnimate(true);
      setOffset((built.length - 1) * STRIDE);
      // Safety net: if `transitionend` never fires for any reason (an
      // interrupted transition, a browser quirk), land anyway once the
      // animation should be done rather than getting stuck "Spinning...".
      fallbackTimer.current = setTimeout(land, SPIN_MS + 300);
    }, 30);
  }

  function handleTransitionEnd(e: React.TransitionEvent) {
    if (e.propertyName !== "transform") return;
    land();
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative w-[260px] overflow-hidden rounded-3xl border-2 border-accent shadow-2xl shadow-black/60">
        <div
          onTransitionEnd={handleTransitionEnd}
          className="flex gap-4"
          style={{
            transform: `translateX(-${offset}px)`,
            transition: animate
              ? `transform ${SPIN_MS}ms cubic-bezier(0.1, 0.7, 0.15, 1)`
              : "none",
          }}
        >
          {reel.length === 0 ? (
            <div className="aspect-2/3 w-[260px] shrink-0 bg-surface-hover" />
          ) : (
            reel.map((movie, i) => {
              const poster = posterUrl(movie.posterPath, "w342");
              return (
                <div
                  key={`${movie.id}-${i}`}
                  className="relative aspect-2/3 w-[260px] shrink-0 overflow-hidden bg-surface-hover"
                >
                  {poster && (
                    <Image src={poster} alt={movie.title} fill className="object-cover" />
                  )}
                </div>
              );
            })
          )}
        </div>
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
