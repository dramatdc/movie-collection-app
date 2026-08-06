"use client";

import { useState } from "react";

export function CameraPermissionGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  if (ready) return <>{children}</>;

  return (
    <div className="flex flex-col items-center gap-4 text-center py-8">
      <p className="text-neutral-300 max-w-xs text-sm">
        We&apos;ll ask for camera access to scan the barcode on your disc
        case. Nothing is recorded or uploaded — the video never leaves your
        device.
      </p>
      <button
        type="button"
        onClick={() => setReady(true)}
        className="bg-emerald-400 text-black font-medium px-4 py-2 rounded-lg text-sm"
      >
        Enable camera
      </button>
    </div>
  );
}
