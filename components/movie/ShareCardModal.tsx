"use client";

import { useRef, useState } from "react";
import { shareMovieCard, type ShareCardMovie, type ShareCardResult } from "@/lib/shareCard";
import { CloseIcon, ShareIcon } from "@/lib/icons";

// How far the card can tilt off its resting position — small on purpose,
// this is meant to read as a subtle, playful wobble (closer to a trading
// card catching the light) rather than letting it spin freely.
const MAX_TILT_DEG = 10;

type CopyState = "idle" | "copying" | ShareCardResult;

const LABELS: Record<CopyState, string> = {
  idle: "Share with friends",
  copying: "Preparing...",
  copied: "Copied! Paste it anywhere",
  shared: "Shared!",
  opened: "Opened in new tab",
  cancelled: "Share with friends",
};

function shareCardImageUrl(movie: ShareCardMovie): string {
  const params = new URLSearchParams();
  params.set("title", movie.title);
  if (movie.year) params.set("year", String(movie.year));
  if (movie.format) params.set("format", movie.format);
  if (movie.posterPath) params.set("poster", movie.posterPath);
  return `/api/share-card?${params.toString()}`;
}

export function ShareCardModal({
  movie,
  onClose,
}: {
  movie: ShareCardMovie | null;
  onClose: () => void;
}) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const cardRef = useRef<HTMLDivElement>(null);

  if (!movie) return null;

  function updateTilt(clientX: number, clientY: number) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
    const py = (clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -py * 2 * MAX_TILT_DEG, y: px * 2 * MAX_TILT_DEG });
  }

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true);
    updateTilt(e.clientX, e.clientY);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    updateTilt(e.clientX, e.clientY);
  }

  function resetTilt() {
    setDragging(false);
    setTilt({ x: 0, y: 0 });
  }

  async function handleShare() {
    setCopyState("copying");
    const result = await shareMovieCard(movie!);
    setCopyState(result);
    if (result !== "cancelled") {
      setTimeout(() => setCopyState("idle"), 2200);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-black/85 p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 text-muted hover:text-white"
        style={{ top: "calc(1.25rem + env(safe-area-inset-top))" }}
      >
        <CloseIcon className="h-6 w-6" />
      </button>

      <div style={{ perspective: 1200 }} onClick={(e) => e.stopPropagation()}>
        {/* Entrance "pop" and the drag tilt both animate `transform`, so
            they're split across two nested elements — on one element, a
            still-filling entrance animation keeps overriding any inline
            transform indefinitely (that's what animation-fill-mode: both
            means), which would silently freeze the tilt in place forever. */}
        <div className="w-64 animate-[card-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both] sm:w-72">
          <div
            ref={cardRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={resetTilt}
            onPointerLeave={resetTilt}
            className="touch-none select-none"
            style={{
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              transition: dragging ? "none" : "transform 0.4s ease-out",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shareCardImageUrl(movie)}
              alt={movie.title}
              draggable={false}
              className="w-full drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-muted">Drag the card to give it a little spin.</p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleShare();
        }}
        disabled={copyState === "copying"}
        className="flex items-center justify-center gap-1.5 rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:opacity-70"
      >
        <ShareIcon className="h-4 w-4" />
        {LABELS[copyState]}
      </button>
    </div>
  );
}
