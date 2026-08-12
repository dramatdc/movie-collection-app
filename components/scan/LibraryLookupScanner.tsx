"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CameraPermissionGate } from "./CameraPermissionGate";
import { BarcodeScanner } from "./BarcodeScanner";
import { lookupUpcClient } from "@/lib/upc/lookup";
import { searchMoviesClient } from "@/lib/tmdb/client";
import { posterUrl } from "@/lib/tmdb/image";
import { addMovieToCollection } from "@/lib/firebase/quickAdd";
import { useAuth } from "@/lib/hooks/useAuth";
import { CameraIcon, CloseIcon } from "@/lib/icons";
import type { OwnedMovie } from "@/lib/firebase/types";
import type { TMDbSearchResult } from "@/lib/tmdb/types";

type LookupResult =
  | { status: "owned"; match: TMDbSearchResult; ownedMovie: OwnedMovie }
  | { status: "not-owned"; match: TMDbSearchResult }
  | { status: "no-match" }
  | { status: "not-found" };

function ResultCard({ result }: { result: LookupResult }) {
  if (result.status === "not-found") {
    return (
      <p className="text-sm text-muted">
        Couldn&apos;t identify that barcode. Try again or search manually.
      </p>
    );
  }
  if (result.status === "no-match") {
    return (
      <p className="text-sm text-muted">
        Found the barcode, but couldn&apos;t match it to a movie.
      </p>
    );
  }

  const poster = posterUrl(result.match.poster_path, "w185");
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded bg-surface-hover">
        {poster && (
          <Image src={poster} alt={result.match.title} fill className="object-cover" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{result.match.title}</p>
        {result.status === "owned" ? (
          <>
            <p className="text-sm text-accent">Already in your collection</p>
            <Link
              href={`/library/${result.ownedMovie.id}`}
              className="text-xs text-accent underline"
            >
              View it
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted">Not in your collection yet</p>
        )}
      </div>
    </div>
  );
}

export function LibraryLookupScanner({ movies }: { movies: OwnedMovie[] }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [adding, setAdding] = useState(false);

  // BarcodeScanner subscribes to onDetected once at mount and never
  // restarts the camera to pick up a new reference, so this must stay a
  // stable callback backed by refs rather than closing over `movies`
  // directly, which could otherwise go stale for as long as the modal
  // stays open.
  const moviesRef = useRef(movies);
  useEffect(() => {
    moviesRef.current = movies;
  }, [movies]);
  const checkingRef = useRef(false);

  const handleDetected = useCallback(async (code: string) => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setChecking(true);
    try {
      const upc = await lookupUpcClient(code);
      if (upc.status !== "found") {
        setResult({ status: "not-found" });
        return;
      }
      const search = await searchMoviesClient(upc.searchTitle);
      const topMatch = search.results?.[0];
      if (!topMatch) {
        setResult({ status: "no-match" });
        return;
      }
      const ownedMovie = moviesRef.current.find((m) => m.tmdbId === topMatch.id);
      setResult(
        ownedMovie
          ? { status: "owned", match: topMatch, ownedMovie }
          : { status: "not-owned", match: topMatch }
      );
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  }, []);

  async function handleAdd() {
    if (!user || result?.status !== "not-owned") return;
    setAdding(true);
    try {
      await addMovieToCollection(user.uid, result.match, {
        barcodeUpc: null,
        addedVia: "scan",
      });
      close();
    } finally {
      setAdding(false);
    }
  }

  function close() {
    setOpen(false);
    setResult(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Check if a movie is already in your collection"
        title="Check if a movie is already in your collection"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted hover:border-accent hover:text-accent"
      >
        <CameraIcon className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4">
          <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Check your collection</h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="text-muted hover:text-white"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>

            {!result && (
              <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                <CameraPermissionGate>
                  <BarcodeScanner onDetected={handleDetected} />
                </CameraPermissionGate>
                {checking && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <p className="text-sm text-white">Checking...</p>
                  </div>
                )}
              </div>
            )}

            {result && (
              <div className="flex flex-col gap-3">
                <ResultCard result={result} />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setResult(null)}
                    className="flex-1 rounded border border-border px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-accent"
                  >
                    Scan another
                  </button>
                  {result.status === "not-owned" && (
                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={adding}
                      className="flex-1 rounded bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
                    >
                      {adding ? "Adding..." : "Add to collection"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
