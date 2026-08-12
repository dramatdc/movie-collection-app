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
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 md:bottom-6">
      <div
        role="status"
        className={clsx(
          "pointer-events-auto flex max-w-sm items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium shadow-xl shadow-black/40 animate-[fade-in-up_0.2s_ease-out]",
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
