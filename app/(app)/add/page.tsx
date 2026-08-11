"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CameraPermissionGate } from "@/components/scan/CameraPermissionGate";
import { BarcodeScanner } from "@/components/scan/BarcodeScanner";
import { TMDbSearchResults } from "@/components/movie/TMDbSearchResults";
import { RecentSearchChips } from "@/components/movie/RecentSearchChips";
import { lookupUpcClient } from "@/lib/upc/lookup";
import { useAddFlow } from "@/lib/context/AddFlowContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { useWishlist } from "@/lib/hooks/useWishlist";
import { useMovies } from "@/lib/hooks/useMovies";
import { useRecentSearches } from "@/lib/hooks/useRecentSearches";
import { addToWishlist } from "@/lib/firebase/wishlist";
import { addOwnedMovie } from "@/lib/firebase/firestore";
import { getMovieDetailClient } from "@/lib/tmdb/client";
import type { TMDbSearchResult } from "@/lib/tmdb/types";

export default function AddPage() {
  const [lookingUp, setLookingUp] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scannedUpc, setScannedUpc] = useState<string | null>(null);
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());
  const { setCandidate, setBarcodeUpc } = useAddFlow();
  const { user } = useAuth();
  const { items: wishlist } = useWishlist();
  const { movies } = useMovies();
  const { recent, record } = useRecentSearches("recent-searches-add");
  const router = useRouter();

  const wishlistTmdbIds = useMemo(
    () => new Set(wishlist.map((i) => i.tmdbId)),
    [wishlist]
  );
  const collectionTmdbIds = useMemo(
    () => new Set(movies.map((m) => m.tmdbId)),
    [movies]
  );

  const handleDetected = useCallback(async (code: string) => {
    setLookingUp(true);
    const result = await lookupUpcClient(code);
    if (result.status === "found") {
      setScannedUpc(code);
      setSearchQuery(result.searchTitle);
    }
    setLookingUp(false);
  }, []);

  function handleSearchQueryChange(value: string) {
    setSearchQuery(value);
    setScannedUpc(null);
  }

  function selectForCollection(result: TMDbSearchResult) {
    record(searchQuery);
    setBarcodeUpc(scannedUpc);
    setCandidate(result);
    router.push("/add/confirm");
  }

  function handleAddToWishlist(result: TMDbSearchResult) {
    if (!user) return;
    record(searchQuery);
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
    setAddingIds((prev) => new Set(prev).add(result.id));
    try {
      const detail = await getMovieDetailClient(result.id);
      await addOwnedMovie(user.uid, {
        tmdbId: detail.id,
        title: detail.title,
        posterPath: detail.poster_path,
        year: detail.release_date ? Number(detail.release_date.slice(0, 4)) : null,
        genres: detail.genres.map((g) => g.name),
        runtimeMinutes: detail.runtime,
        overview: detail.overview,
        format: "Blu-ray",
        location: null,
        watched: false,
        personalRating: null,
        barcodeUpc: null,
        addedVia: "manual",
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

      <section className="flex flex-1 flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-lg shadow-black/40">
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
            onSelect={selectForCollection}
            onAddToWishlist={handleAddToWishlist}
            wishlistTmdbIds={wishlistTmdbIds}
            onAddToCollection={handleAddToCollection}
            collectionTmdbIds={collectionTmdbIds}
            addingToCollectionIds={addingIds}
          />
        </div>
      </section>
    </div>
  );
}
