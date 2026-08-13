"use client";

import { useEffect, useState } from "react";

const GRANTED_KEY = "camera-permission-granted";

type PermState = "checking" | "granted" | "denied" | "prompt";

export function CameraPermissionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<PermState>("checking");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // The Permissions API tells us the browser's ACTUAL current camera
      // state — unlike our own localStorage flag, this can't go stale if
      // the user (or a previous account on this device) denied access at
      // some point. Support is inconsistent (Safari in particular), so
      // fall back to the remembered flag when it's unavailable.
      if (navigator.permissions?.query) {
        try {
          const status = await navigator.permissions.query({
            name: "camera" as PermissionName,
          });
          if (cancelled) return;
          setState(status.state as PermState);
          status.onchange = () => setState(status.state as PermState);
          return;
        } catch {
          // fall through to the localStorage-based guess below
        }
      }
      if (!cancelled) {
        setState(localStorage.getItem(GRANTED_KEY) ? "granted" : "prompt");
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "checking") return null;

  if (state === "granted") return <>{children}</>;

  if (state === "denied") {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <p className="max-w-xs text-sm text-neutral-300">
          Camera access is turned off for this site. Turn it back on in your
          browser or phone settings, then come back here.
        </p>
        <div className="w-full max-w-xs rounded-lg border border-border bg-canvas p-3 text-left text-xs leading-relaxed text-muted">
          <p className="font-medium text-neutral-300">iPhone (Safari)</p>
          <p>Settings → Safari → Camera → Allow</p>
          <p className="mt-2 font-medium text-neutral-300">Android (Chrome)</p>
          <p>Tap the lock icon next to the address bar → Permissions → Camera</p>
        </div>
        <p className="text-xs text-muted">Or just search by title instead — no camera needed.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <p className="max-w-xs text-sm text-neutral-300">
        We&apos;ll ask for camera access to scan the barcode on your disc
        case. Nothing is recorded or uploaded — the video never leaves your
        device.
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(GRANTED_KEY, "1");
          setState("granted");
        }}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
      >
        Enable camera
      </button>
    </div>
  );
}
