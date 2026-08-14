export interface ShareCardMovie {
  title: string;
  year: number | null;
  format?: string | null;
  posterPath: string | null;
}

// Always the same URL for a given movie (no extra params that vary by call
// site) so every fetch — the modal's preview <img>, then this file's copy
// and share-sheet paths — hits the exact same cache entry instead of
// regenerating the image again on every step.
function shareCardUrl(movie: ShareCardMovie): string {
  const params = new URLSearchParams();
  params.set("title", movie.title);
  if (movie.year) params.set("year", String(movie.year));
  if (movie.format) params.set("format", movie.format);
  if (movie.posterPath) params.set("poster", movie.posterPath);
  return `/api/share-card?${params.toString()}`;
}

export type ShareCardResult = "copied" | "shared" | "opened" | "cancelled";

// Tries, in order: copy the image straight to the clipboard (the point —
// this is what lets it get pasted into a chat), the native share sheet,
// then as a last resort just opens the image so it can be saved or
// long-press-copied by hand. Never throws — always resolves to whatever
// actually happened.
export async function shareMovieCard(movie: ShareCardMovie): Promise<ShareCardResult> {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      // The blob is passed as a pending promise rather than awaited first —
      // Safari only allows a clipboard write tied to a direct user gesture,
      // and constructing the ClipboardItem this way keeps the write inside
      // that gesture even though the fetch behind it is async.
      const item = new ClipboardItem({
        "image/png": fetch(shareCardUrl(movie)).then((res) => {
          if (!res.ok) throw new Error(`share-card fetch failed: ${res.status}`);
          return res.blob();
        }),
      });
      await navigator.clipboard.write([item]);
      return "copied";
    } catch {
      // Fall through to the next option below.
    }
  }

  if (navigator.share && navigator.canShare) {
    try {
      const res = await fetch(shareCardUrl(movie));
      if (!res.ok) throw new Error(`share-card fetch failed: ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], "hardcopy-share.png", { type: blob.type });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] });
        return "shared";
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return "cancelled";
      }
      // Fall through to the next option below.
    }
  }

  window.open(shareCardUrl(movie), "_blank");
  return "opened";
}
