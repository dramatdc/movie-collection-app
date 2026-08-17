"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType, NotFoundException } from "@zxing/library";

type ScanError = "denied" | "no-camera" | "in-use" | "unknown";

interface ScanControls {
  stop: () => void;
}

const NATIVE_FORMATS = ["upc_a", "upc_e", "ean_13", "ean_8"];

// Sharper decode frames than the browser default (often 640x480) directly
// improve zxing's read rate/latency on small, dense retail barcodes.
const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: "environment",
  width: { ideal: 1280 },
  height: { ideal: 720 },
};

async function tryNativeDetector(
  video: HTMLVideoElement,
  onDetected: (code: string) => void
): Promise<ScanControls | null> {
  const BarcodeDetectorCtor = (
    window as typeof window & {
      BarcodeDetector?: {
        new (opts: { formats: string[] }): {
          detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
        };
        getSupportedFormats: () => Promise<string[]>;
      };
    }
  ).BarcodeDetector;

  if (!BarcodeDetectorCtor) return null;

  const supported = await BarcodeDetectorCtor.getSupportedFormats().catch(
    (): string[] => []
  );
  const formats = NATIVE_FORMATS.filter((f) => supported.includes(f));
  if (formats.length === 0) return null;

  const stream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS });
  video.srcObject = stream;
  await video.play();

  const detector = new BarcodeDetectorCtor({ formats });
  let stopped = false;
  const lastCodeRef = { code: "", at: 0 };

  const tick = async () => {
    if (stopped) return;
    try {
      const codes = await detector.detect(video);
      if (codes.length > 0) {
        const code = codes[0].rawValue;
        const now = Date.now();
        if (!(lastCodeRef.code === code && now - lastCodeRef.at < 3000)) {
          lastCodeRef.code = code;
          lastCodeRef.at = now;
          onDetected(code);
        }
      }
    } catch {
      // transient decode errors are expected mid-frame; ignore and retry
    }
    if (!stopped) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  return {
    stop: () => {
      stopped = true;
      stream.getTracks().forEach((t) => t.stop());
    },
  };
}

export function BarcodeScanner({
  onDetected,
}: {
  onDetected: (code: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<ScanError | null>(null);

  useEffect(() => {
    let stopped = false;
    let controls: ScanControls | undefined;

    async function start() {
      const video = videoRef.current!;
      try {
        const native = await tryNativeDetector(video, onDetected);
        if (stopped) return;
        if (native) {
          controls = native;
          return;
        }
      } catch {
        // fall through to zxing below
      }
      if (stopped) return;

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
      ]);
      const reader = new BrowserMultiFormatReader(hints);
      const lastCodeRef = { code: "", at: 0 };

      controls = await reader.decodeFromConstraints(
        { video: VIDEO_CONSTRAINTS },
        video,
        (result, err) => {
          if (stopped) return;
          if (result) {
            const code = result.getText();
            const now = Date.now();
            if (lastCodeRef.code === code && now - lastCodeRef.at < 3000) return;
            lastCodeRef.code = code;
            lastCodeRef.at = now;
            onDetected(code);
          } else if (err && !(err instanceof NotFoundException)) {
            console.error("Barcode decode error", err);
          }
        }
      );
    }

    start().catch((err: unknown) => {
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
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 text-sm text-neutral-300">
        {error === "denied" && (
          <>
            <p>Camera access is turned off for this site.</p>
            <p className="text-xs text-muted">
              iPhone: Settings → Safari → Camera → Allow. Android: tap the lock
              icon next to the address bar → Permissions → Camera. Or just
              search by title instead.
            </p>
          </>
        )}
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
    <div className="relative aspect-square w-full h-full overflow-hidden rounded-lg bg-black">
      <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
      <div className="pointer-events-none absolute inset-8 animate-pulse rounded-lg border-2 border-accent/70" />
    </div>
  );
}
