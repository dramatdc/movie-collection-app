"use client";

import { useEffect } from "react";
import clsx from "clsx";

export interface ToastState {
  message: string;
  tone: "success" | "warning";
}

export function Toast({
  toast,
  onDismiss,
  durationMs = 3200,
}: {
  toast: ToastState | null;
  onDismiss: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  if (!toast) return null;

  return (
    // Anchored below the header rather than the bottom of the screen —
    // eye-line is naturally where attention already is, whereas the bottom
    // (especially on a tall phone) sits well outside normal reading range
    // and is easy to miss. env(safe-area-inset-top) keeps the same
    // clearance below the header on notched devices, where the header
    // itself grows taller.
    <div
      className="pointer-events-none fixed inset-x-0 z-30 flex justify-center px-4"
      style={{ top: "calc(5.5rem + env(safe-area-inset-top))" }}
    >
      <div
        role="status"
        className={clsx(
          "pointer-events-auto flex max-w-md items-center gap-2.5 rounded-2xl px-6 py-4 text-base font-medium shadow-2xl shadow-black/50 animate-[fade-in-up_0.2s_ease-out]",
          toast.tone === "success"
            ? "bg-accent text-accent-foreground"
            : "bg-surface border border-border text-white"
        )}
      >
        {toast.message}
      </div>
    </div>
  );
}
