"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType, NotFoundException } from "@zxing/library";

type ScanError = "denied" | "no-camera" | "in-use" | "unknown";

export function BarcodeScanner({
  onDetected,
}: {
  onDetected: (code: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [error, setError] = useState<ScanError | null>(null);
  const lastCodeRef = useRef<{ code: string; at: number } | null>(null);

  useEffect(() => {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
    ]);
    const reader = new BrowserMultiFormatReader(hints);
    readerRef.current = reader;
    let stopped = false;
    let controls: { stop: () => void } | undefined;

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current!,
        (result, err) => {
          if (stopped) return;
          if (result) {
            const code = result.getText();
            const now = Date.now();
            const last = lastCodeRef.current;
            if (last && last.code === code && now - last.at < 3000) {
              return;
            }
            lastCodeRef.current = { code, at: now };
            onDetected(code);
          } else if (err && !(err instanceof NotFoundException)) {
            console.error("Barcode decode error", err);
          }
        }
      )
      .then((c) => {
        controls = c;
      })
      .catch((err: unknown) => {
        if (stopped) return;
        const name = err instanceof DOMException ? err.name : "";
        if (name === "NotAllowedError") setError("denied");
        else if (name === "NotFoundError") setError("no-camera");
        else if (name === "NotReadableError") setError("in-use");
        else setError("unknown");
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4 text-sm text-neutral-300">
        {error === "denied" &&
          "Camera access was denied. Enable camera permission for this site in Settings, or search by title instead."}
        {error === "no-camera" &&
          "No camera was found on this device. Search by title instead."}
        {error === "in-use" &&
          "The camera is in use by another app. Close it and try again, or search by title."}
        {error === "unknown" &&
          "Couldn't access the camera. Search by title instead."}
      </div>
    );
  }

  return (
    <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg bg-black">
      <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
      <div className="pointer-events-none absolute inset-8 rounded-lg border-2 border-emerald-400/70" />
    </div>
  );
}
