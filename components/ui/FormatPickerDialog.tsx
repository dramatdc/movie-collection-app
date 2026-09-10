"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { MOVIE_FORMATS, type MovieFormat } from "@/lib/firebase/types";
import { getRememberedFormat, setRememberedFormat } from "@/lib/addFormatMemory";

type PickFormatFn = (movieTitle: string) => Promise<MovieFormat | null>;

const FormatPickerContext = createContext<PickFormatFn | null>(null);

/** Resolves to the format to add a movie as, or null if the user canceled.
 * Skips showing anything at all if a format's already been remembered for
 * this session (see lib/addFormatMemory.ts). */
export function useFormatPicker(): PickFormatFn {
  const ctx = useContext(FormatPickerContext);
  if (!ctx) {
    throw new Error("useFormatPicker must be used within a FormatPickerProvider");
  }
  return ctx;
}

export function FormatPickerProvider({ children }: { children: React.ReactNode }) {
  const [movieTitle, setMovieTitle] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);
  const resolveRef = useRef<((value: MovieFormat | null) => void) | null>(null);

  const pickFormat = useCallback<PickFormatFn>((title) => {
    const remembered = getRememberedFormat();
    if (remembered) return Promise.resolve(remembered);

    setMovieTitle(title);
    setRemember(false);
    return new Promise<MovieFormat | null>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function respond(format: MovieFormat | null) {
    if (format && remember) setRememberedFormat(format);
    setMovieTitle(null);
    resolveRef.current?.(format);
    resolveRef.current = null;
  }

  return (
    <FormatPickerContext.Provider value={pickFormat}>
      {children}
      {movieTitle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => respond(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-black/50"
          >
            <div>
              <h2 className="text-base font-semibold">What format is this?</h2>
              <p className="mt-1 truncate text-sm text-muted">{movieTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MOVIE_FORMATS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => respond(f)}
                  className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-accent hover:text-accent"
                >
                  {f}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Use this format automatically until I close the app
            </label>

            <button
              type="button"
              onClick={() => respond(null)}
              className="self-end text-sm text-muted hover:text-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </FormatPickerContext.Provider>
  );
}
