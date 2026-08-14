"use client";

import { useState } from "react";
import { shareMovieCard, type ShareCardMovie, type ShareCardResult } from "@/lib/shareCard";
import { CloseIcon, ShareIcon } from "@/lib/icons";
import { useLockBodyScroll } from "@/lib/hooks/useLockBodyScroll";

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
  const [copyState, setCopyState] = useState<CopyState>("idle");
  useLockBodyScroll(!!movie);

  if (!movie) return null;

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

      <div
        className="w-64 animate-[card-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_both] sm:w-72"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shareCardImageUrl(movie)}
          alt={movie.title}
          draggable={false}
          className="w-full select-none drop-shadow-2xl"
        />
      </div>

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
