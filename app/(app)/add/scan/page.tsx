"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CameraPermissionGate } from "@/components/scan/CameraPermissionGate";
import { BarcodeScanner } from "@/components/scan/BarcodeScanner";
import { TMDbSearchResults } from "@/components/movie/TMDbSearchResults";
import { lookupUpcClient } from "@/lib/upc/lookup";
import { useAddFlow } from "@/lib/context/AddFlowContext";

type Stage =
  | { kind: "scanning" }
  | { kind: "looking-up"; upc: string }
  | { kind: "resolved"; upc: string; query: string }
  | { kind: "not-found"; upc: string }
  | { kind: "rate-limited"; upc: string };

export default function ScanAddPage() {
  const [stage, setStage] = useState<Stage>({ kind: "scanning" });
  const { setCandidate, setBarcodeUpc } = useAddFlow();
  const router = useRouter();

  const handleDetected = useCallback(async (code: string) => {
    setStage({ kind: "looking-up", upc: code });
    const result = await lookupUpcClient(code);
    if (result.status === "found") {
      setStage({ kind: "resolved", upc: code, query: result.searchTitle });
    } else if (result.status === "rate_limited") {
      setStage({ kind: "rate-limited", upc: code });
    } else {
      setStage({ kind: "not-found", upc: code });
    }
  }, []);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-xl font-semibold">Scan barcode</h1>

      {stage.kind === "scanning" && (
        <CameraPermissionGate>
          <BarcodeScanner onDetected={handleDetected} />
        </CameraPermissionGate>
      )}

      {stage.kind === "looking-up" && (
        <p className="text-sm text-neutral-400">
          Found barcode {stage.upc} — looking it up...
        </p>
      )}

      {stage.kind === "resolved" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-neutral-400">
            Barcode {stage.upc} looks like &ldquo;{stage.query}&rdquo;. Confirm the
            right match below:
          </p>
          <TMDbSearchResults
            query={stage.query}
            onSelect={(r) => {
              setBarcodeUpc(stage.upc);
              setCandidate(r);
              router.push("/add/confirm");
            }}
          />
          <Link href="/add/search" className="text-sm text-emerald-400">
            Not right? Search by title instead
          </Link>
        </div>
      )}

      {(stage.kind === "not-found" || stage.kind === "rate-limited") && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral-400">
            {stage.kind === "not-found"
              ? `Couldn't find a product match for barcode ${stage.upc}.`
              : "Barcode lookups have hit today's free-tier limit."}
          </p>
          <Link
            href="/add/search"
            className="w-fit rounded bg-emerald-400 px-3 py-1.5 text-sm font-medium text-black"
          >
            Search by title instead
          </Link>
          <button
            type="button"
            onClick={() => setStage({ kind: "scanning" })}
            className="w-fit text-sm text-neutral-400 underline"
          >
            Try scanning again
          </button>
        </div>
      )}
    </div>
  );
}
