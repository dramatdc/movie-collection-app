"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { posterUrl } from "@/lib/tmdb/image";
import { FormatBadge } from "@/components/movie/FormatBadge";
import type { OwnedMovie } from "@/lib/firebase/types";

type LoadState = "loading" | "ok" | "unavailable";

// Public, no-login page — lives outside the (app) route group on purpose so
// it doesn't inherit that layout's auth redirect. Read-only: no edit
// controls, no links back into the authenticated app. Firestore access is
// gated entirely by rules (see firestore.rules) — a permission error here
// just means the link is invalid or sharing has been turned off, which
// reads the same as any other "unavailable" state to a visitor.
export default function SharedCollectionPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [state, setState] = useState<LoadState>("loading");
  const [movies, setMovies] = useState<OwnedMovie[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const linkSnap = await getDoc(doc(db, "shareLinks", shareId));
        if (!linkSnap.exists()) {
          if (!cancelled) setState("unavailable");
          return;
        }
        const uid = linkSnap.data().uid as string;
        const moviesSnap = await getDocs(collection(db, "users", uid, "movies"));
        if (cancelled) return;
        const items = moviesSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as OwnedMovie)
          .sort((a, b) => a.title.localeCompare(b.title));
        setMovies(items);
        setState("ok");
      } catch {
        if (!cancelled) setState("unavailable");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [shareId]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-accent">Shared collection</p>
        <h1 className="text-xl font-semibold">
          {state === "ok" ? `${movies.length} ${movies.length === 1 ? "movie" : "movies"}` : "Hardcopy"}
        </h1>
        <p className="text-sm text-muted">Read-only — this link doesn&apos;t give access to the account.</p>
      </div>

      {state === "loading" && <p className="py-16 text-center text-sm text-muted">Loading...</p>}

      {state === "unavailable" && (
        <p className="py-16 text-center text-sm text-muted">
          This link isn&apos;t available. It may have been turned off or never existed.
        </p>
      )}

      {state === "ok" && movies.length === 0 && (
        <p className="py-16 text-center text-sm text-muted">Nothing in this collection yet.</p>
      )}

      {state === "ok" && movies.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {movies.map((movie) => {
            const poster = posterUrl(movie.posterPath, "w342");
            return (
              <div key={movie.id} className="flex flex-col gap-1.5">
                <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-surface-hover shadow-lg shadow-black/40">
                  {poster ? (
                    <Image src={poster} alt={movie.title} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
                      {movie.title}
                    </div>
                  )}
                </div>
                <p className="truncate text-xs font-medium">{movie.title}</p>
                <div className="flex items-center gap-1.5">
                  {movie.year && <p className="text-xs text-muted">{movie.year}</p>}
                  <FormatBadge format={movie.format} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-auto pt-6 text-center text-xs text-muted">
        Shared from <span className="font-medium text-accent">Hardcopy</span>
      </p>
    </div>
  );
}
