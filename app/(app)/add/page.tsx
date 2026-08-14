"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CameraPermissionGate } from "@/components/scan/CameraPermissionGate";
import { BarcodeScanner } from "@/components/scan/BarcodeScanner";
import { TMDbSearchResults } from "@/components/movie/TMDbSearchResults";
import { RecentSearchChips } from "@/components/movie/RecentSearchChips";
import { Toast, type ToastState } from "@/components/ui/Toast";
import { lookupUpcClient } from "@/lib/upc/lookup";
import { recordUpcResolution } from "@/lib/upc/crowdsource";
import { useAddFlow } from "@/lib/context/AddFlowContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useMovies } from "@/lib/hooks/useMovies";
import { useRecentSearches } from "@/lib/hooks/useRecentSearches";
import { addToWishlist } from "@/lib/firebase/wishlist";
import { addMovieToCollection } from "@/lib/firebase/quickAdd";
import { searchMoviesClient } from "@/lib/tmdb/client";
import { hapticImpact } from "@/lib/haptics";
import { playAddedChime } from "@/lib/sound";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import type { TMDbSearchResult } from "@/lib/tmdb/types";

function AddPageContent() {
  const searchParams = useSearchParams();
  // Reached via the Wishlist page's own "+" button — both the search and
  // scan panels below add straight to the wishlist instead of the owned
  // collection while this is set, since some users specifically want that
  // entry point rather than the inline "search to add" box on that page.
  const isWishlistMode = searchParams.get("mode") === "wishlist";

  const [lookingUp, setLookingUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scannedUpc, setScannedUpc] = useState<string | null>(null);
  // True when the scanned barcode didn't resolve automatically (miss or
  // rate limit) — if the user then finds and adds the right movie by hand,
  // we link that barcode to the title in upc_cache so the next scan of it
  // is a free cache hit instead of another API call.
  const [needsCrowdsourcing, setNeedsCrowdsourcing] = useState(false);
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<ToastState | null>(null);
  const { setCandidate, setBarcodeUpc } = useAddFlow();
  const { user } = useAuth();
  const { items: wishlist } = useWishlist();
  const { movies } = useMovies();
  const { recent, record } = useRecentSearches("recent-searches-add");
  const router = useRouter();
  const confirmDialog = useConfirm();

  const wishlistTmdbIds = useMemo(
    () => new Set(wishlist.map((i) => i.tmdbId)),
    [wishlist]
  );
  const collectionTmdbIds = useMemo(
    () => new Set(movies.map((m) => m.tmdbId)),
    [movies]
  );

  // BarcodeScanner subscribes to onDetected once at mount and never restarts
  // the camera to pick up a new reference, so handleDetected must stay a
  // stable callback — these refs let it always see fresh auth/collection
  // state without needing to be recreated.
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);
  const collectionTmdbIdsRef = useRef(collectionTmdbIds);
  useEffect(() => {
    collectionTmdbIdsRef.current = collectionTmdbIds;
  }, [collectionTmdbIds]);
  const wishlistTmdbIdsRef = useRef(wishlistTmdbIds);
  useEffect(() => {
    wishlistTmdbIdsRef.current = wishlistTmdbIds;
  }, [wishlistTmdbIds]);
  const isWishlistModeRef = useRef(isWishlistMode);
  useEffect(() => {
    isWishlistModeRef.current = isWishlistMode;
  }, [isWishlistMode]);
  const lastHandledCodeRef = useRef<string | null>(null);

  const handleDetected = useCallback(async (code: string) => {
    if (lastHandledCodeRef.current === code) return;
    lastHandledCodeRef.current = code;

    setLookingUp(true);
    try {
      const result = await lookupUpcClient(code);
      if (result.status === "rate_limited") {
        setScannedUpc(code);
        setNeedsCrowdsourcing(true);
        setToast({
          tone: "warning",
          message: "Daily barcode lookup limit reached — search by title instead for now.",
        });
        return;
      }
      if (result.status !== "found") {
        setScannedUpc(code);
        setNeedsCrowdsourcing(true);
        setToast({
          tone: "warning",
          message: "Couldn't identify that barcode — search by title instead.",
        });
        return;
      }

      setScannedUpc(code);
      setNeedsCrowdsourcing(false);

      const searchResults = await searchMoviesClient(result.searchTitle);
      const topMatch = searchResults.results?.[0];
      if (!topMatch) {
        // No auto-add possible — fall back to showing it in the search
        // results section so the user can find and add it by hand.
        setSearchQuery(result.searchTitle);
        return;
      }

      const wishlistMode = isWishlistModeRef.current;
      const uid = userRef.current?.uid;

      if (wishlistMode) {
        if (wishlistTmdbIdsRef.current.has(topMatch.id)) {
          setSearchQuery(result.searchTitle);
          setToast({
            tone: "warning",
            message: `Already on your wishlist: "${topMatch.title}"`,
          });
          return;
        }
        if (!uid) return;
        playAddedChime();
        hapticImpact();
        setToast({ tone: "success", message: `Added "${topMatch.title}" to your wishlist` });
        await addToWishlist(uid, {
          tmdbId: topMatch.id,
          title: topMatch.title,
          posterPath: topMatch.poster_path,
          year: topMatch.release_date ? Number(topMatch.release_date.slice(0, 4)) : null,
        });
        return;
      }

      if (collectionTmdbIdsRef.current.has(topMatch.id)) {
        setSearchQuery(result.searchTitle);
        setToast({
          tone: "warning",
          message: `Already in your collection: "${topMatch.title}"`,
        });
        return;
      }

      if (!uid) return;
      playAddedChime();
      hapticImpact();
      setToast({ tone: "success", message: `Added "${topMatch.title}" to your collection` });
      await addMovieToCollection(uid, topMatch, { barcodeUpc: code, addedVia: "scan" });
    } finally {
      setLookingUp(false);
    }
  }, []);

  function handleSearchQueryChange(value: string) {
    setSearchQuery(value);
    setScannedUpc(null);
    setNeedsCrowdsourcing(false);
  }

  function selectForCollection(result: TMDbSearchResult) {
    record(searchQuery);
    if (needsCrowdsourcing && scannedUpc) {
      recordUpcResolution(scannedUpc, result.title);
    }
    setBarcodeUpc(scannedUpc);
    setCandidate(result);
    router.push("/add/confirm");
  }

  async function handleAddToWishlist(result: TMDbSearchResult) {
    if (!user) return;
    if (collectionTmdbIds.has(result.id)) {
      const confirmed = await confirmDialog({
        title: "Already in your collection",
        message: `You already own "${result.title}". Add it to your wishlist anyway?`,
        confirmLabel: "Add anyway",
      });
      if (!confirmed) return;
    }
    record(searchQuery);
    playAddedChime();
    addToWishlist(user.uid, {
      tmdbId: result.id,
      title: result.title,
      posterPath: result.poster_path,
      year: result.release_date ? Number(result.release_date.slice(0, 4)) : null,
    });
  }

  async function handleAddToCollection(result: TMDbSearchResult) {
    if (!user) return;
    record(searchQuery);
    if (needsCrowdsourcing && scannedUpc) {
      recordUpcResolution(scannedUpc, result.title);
    }
    playAddedChime();
    setAddingIds((prev) => new Set(prev).add(result.id));
    try {
      await addMovieToCollection(user.uid, result, {
        barcodeUpc: scannedUpc,
        addedVia: scannedUpc ? "scan" : "manual",
      });
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(result.id);
        return next;
      });
    }
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-8rem)] flex-col gap-4 md:flex-row">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {isWishlistMode && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent md:hidden">
          Adding to your wishlist
        </div>
      )}

      <section
        data-tutorial="add-search"
        className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-lg shadow-black/40"
      >
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Search by title
        </h2>
        <input
          type="text"
          placeholder="e.g. The Matrix"
          value={searchQuery}
          onChange={(e) => handleSearchQueryChange(e.target.value)}
          className="rounded border border-border bg-canvas px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        {!searchQuery.trim() && (
          <RecentSearchChips recent={recent} onSelect={setSearchQuery} />
        )}
        <div className="flex-1 min-h-0">
          <TMDbSearchResults
            query={searchQuery}
            onSelect={isWishlistMode ? handleAddToWishlist : selectForCollection}
            onAddToWishlist={handleAddToWishlist}
            wishlistTmdbIds={wishlistTmdbIds}
            onAddToCollection={isWishlistMode ? undefined : handleAddToCollection}
            collectionTmdbIds={collectionTmdbIds}
            addingToCollectionIds={addingIds}
          />
        </div>
      </section>

      <section className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-lg shadow-black/40">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Scan barcode
        </h2>

        <div className="relative flex flex-1 items-center justify-center">
          <CameraPermissionGate>
            <BarcodeScanner onDetected={handleDetected} />
          </CameraPermissionGate>
          {lookingUp && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60">
              <p className="text-sm text-white">Looking up barcode...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function AddPage() {
  return (
    <Suspense fallback={null}>
      <AddPageContent />
    </Suspense>
  );
}
