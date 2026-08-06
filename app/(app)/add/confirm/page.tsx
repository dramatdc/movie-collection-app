"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAddFlow } from "@/lib/context/AddFlowContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { getMovieDetailClient } from "@/lib/tmdb/client";
import { posterUrl } from "@/lib/tmdb/image";
import { addOwnedMovie } from "@/lib/firebase/firestore";
import type { TMDbMovieDetail } from "@/lib/tmdb/types";
import type { MovieFormat } from "@/lib/firebase/types";

const FORMATS: MovieFormat[] = ["DVD", "Blu-ray", "4K UHD", "Digital"];

export default function ConfirmAddPage() {
  const { candidate, barcodeUpc } = useAddFlow();
  const { user } = useAuth();
  const router = useRouter();

  const [detail, setDetail] = useState<TMDbMovieDetail | null>(null);
  const [format, setFormat] = useState<MovieFormat>("Blu-ray");
  const [location, setLocation] = useState("");
  const [watched, setWatched] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!candidate) {
      router.replace("/add");
      return;
    }
    getMovieDetailClient(candidate.id).then(setDetail);
  }, [candidate, router]);

  if (!candidate || !detail) {
    return <p className="py-16 text-center text-sm text-neutral-500">Loading...</p>;
  }

  const poster = posterUrl(detail.poster_path, "w342");

  async function handleSave() {
    if (!user || !detail) return;
    setSaving(true);
    try {
      await addOwnedMovie(user.uid, {
        tmdbId: detail.id,
        title: detail.title,
        posterPath: detail.poster_path,
        year: detail.release_date ? Number(detail.release_date.slice(0, 4)) : null,
        genres: detail.genres.map((g) => g.name),
        runtimeMinutes: detail.runtime,
        overview: detail.overview,
        format,
        location: location || null,
        watched,
        personalRating: null,
        barcodeUpc,
        addedVia: barcodeUpc ? "scan" : "manual",
      });
      router.push("/library");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-xl font-semibold">Confirm details</h1>

      <div className="flex gap-3">
        <div className="relative aspect-2/3 w-24 shrink-0 overflow-hidden rounded bg-neutral-800">
          {poster && <Image src={poster} alt={detail.title} fill className="object-cover" />}
        </div>
        <div>
          <p className="font-medium">{detail.title}</p>
          <p className="text-sm text-neutral-400">
            {detail.release_date?.slice(0, 4)} · {detail.runtime ? `${detail.runtime} min` : "—"}
          </p>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        Format
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as MovieFormat)}
          className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5"
        >
          {FORMATS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Shelf / location (optional)
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={watched} onChange={(e) => setWatched(e.target.checked)} />
        I&apos;ve already watched this
      </label>

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-2 rounded bg-emerald-400 px-3 py-2 text-sm font-medium text-black disabled:opacity-60"
      >
        {saving ? "Saving..." : "Add to collection"}
      </button>
    </div>
  );
}
