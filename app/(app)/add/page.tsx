"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraPermissionGate } from "@/components/scan/CameraPermissionGate";
import { BarcodeScanner } from "@/components/scan/BarcodeScanner";
import { TMDbSearchResults } from "@/components/movie/TMDbSearchResults";
import { lookupUpcClient } from "@/lib/upc/lookup";
import { useAddFlow } from "@/lib/context/AddFlowContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { addToWatchlist } from "@/lib/firebase/watchlist";
import type { TMDbSearchResult } from "@/lib/tmdb/types";

type ScanStage =
  | { kind: "scanning" }
  | { kind: "looking-up"; upc: string }
  | { kind: "resolved"; upc: string; query: string }
  | { kind: "not-found"; upc: string }
  | { kind: "rate-limited"; upc: string };

export default function AddPage() {
  const [scanStage, setScanStage] = useState<ScanStage>({ kind: "scanning" });
  const [searchQuery, setSearchQuery] = useState("");
  const { setCandidate, setBarcodeUpc } = useAddFlow();
  const { user } = useAuth();
  const { items: watchlist } = useWatchlist();
  const router = useRouter();

  const watchlistTmdbIds = useMemo(
    () => new Set(watchlist.map((i) => i.tmdbId)),
    [watchlist]
  );

  const handleDetected = useCallback(async (code: string) => {
    setScanStage({ kind: "looking-up", upc: code });
    const result = await lookupUpcClient(code);
    if (result.status === "found") {
      setScanStage({ kind: "resolved", upc: code, query: result.searchTitle });
    } else if (result.status === "rate_limited") {
      setScanStage({ kind: "rate-limited", upc: code });
    } else {
      setScanStage({ kind: "not-found", upc: code });
    }
  }, []);

  function selectForCollection(result: TMDbSearchResult, upc: string | null) {
    setBarcodeUpc(upc);
    setCandidate(result);
    router.push("/add/confirm");
  }

  function handleAddToWatchlist(result: TMDbSearchResult) {
    if (!user) return;
    addToWatchlist(user.uid, {
      tmdbId: result.id,
      title: result.title,
      posterPath: result.poster_path,
      year: result.release_date ? Number(result.release_date.slice(0, 4)) : null,
    });
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-8rem)] flex-col gap-4 md:flex-row">
      <section className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-lg shadow-black/40">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Scan barcode
        </h2>

        {scanStage.kind === "scanning" && (
          <div className="flex flex-1 items-center justify-center">
            <CameraPermissionGate>
              <BarcodeScanner onDetected={handleDetected} />
            </CameraPermissionGate>
          </div>
        )}

        {scanStage.kind === "looking-up" && (
          <p className="text-sm text-muted">
            Found barcode {scanStage.upc} — looking it up...
          </p>
        )}

        {scanStage.kind === "resolved" && (
          <div className="flex flex-1 flex-col gap-3 min-h-0">
            <p className="text-sm text-muted">
              Barcode {scanStage.upc} looks like &ldquo;{scanStage.query}&rdquo;. Confirm
              the right match:
            </p>
            <TMDbSearchResults
              query={scanStage.query}
              onSelect={(r) => selectForCollection(r, scanStage.upc)}
              onAddToWatchlist={handleAddToWatchlist}
              watchlistTmdbIds={watchlistTmdbIds}
            />
            <button
              type="button"
              onClick={() => setScanStage({ kind: "scanning" })}
              className="w-fit text-sm text-accent"
            >
              Not right? Scan again
            </button>
          </div>
        )}

        {(scanStage.kind === "not-found" || scanStage.kind === "rate-limited") && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">
              {scanStage.kind === "not-found"
                ? `Couldn't find a product match for barcode ${scanStage.upc}.`
                : "Barcode lookups have hit today's free-tier limit."}
            </p>
            <p className="text-sm text-muted">Search by title on the right instead.</p>
            <button
              type="button"
              onClick={() => setScanStage({ kind: "scanning" })}
              className="w-fit text-sm text-accent underline"
            >
              Try scanning again
            </button>
          </div>
        )}
      </section>

      <section className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-lg shadow-black/40">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Search by title
        </h2>
        <input
          type="text"
          placeholder="e.g. The Matrix"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded border border-border bg-canvas px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <div className="flex-1 min-h-0">
          <TMDbSearchResults
            query={searchQuery}
            onSelect={(r) => selectForCollection(r, null)}
            onAddToWatchlist={handleAddToWatchlist}
            watchlistTmdbIds={watchlistTmdbIds}
          />
        </div>
      </section>
    </div>
  );
}
