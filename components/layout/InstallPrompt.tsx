"use client";

import { useEffect, useState } from "react";
import { CloseIcon, ShareIcon } from "@/lib/icons";

const DISMISS_KEY = "install-prompt-dismissed";

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari-specific flag
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISS_KEY) && !isStandalone() && isIos()) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 md:bottom-4 z-20 mx-auto max-w-sm rounded-lg border border-border bg-surface p-3 text-sm text-neutral-200 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-1.5">
          Install this app: tap the Share icon
          <ShareIcon className="h-4 w-4 shrink-0 text-accent" />
          then <strong>Add to Home Screen</strong>.
        </p>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "1");
            setVisible(false);
          }}
          className="shrink-0 text-muted hover:text-white"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
