"use client";

import { useEffect, useState } from "react";

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
    <div className="fixed inset-x-0 bottom-16 md:bottom-4 z-20 mx-auto max-w-sm rounded-lg border border-neutral-700 bg-neutral-900 p-3 text-sm text-neutral-200 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <p>
          Install this app: tap the Share icon <span aria-hidden>􀈂</span>{" "}
          then <strong>Add to Home Screen</strong>.
        </p>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={() => {
            localStorage.setItem(DISMISS_KEY, "1");
            setVisible(false);
          }}
          className="text-neutral-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
