"use client";

import { useState } from "react";
import { estimateCollectionValue } from "@/lib/collectionValue";
import type { OwnedMovie } from "@/lib/firebase/types";
import { CloseIcon } from "@/lib/icons";

function formatUSD(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function CollectionValueButton({ movies }: { movies: OwnedMovie[] }) {
  const [open, setOpen] = useState(false);
  const { total, breakdown } = estimateCollectionValue(movies);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-fit rounded-full border border-border px-3 py-1.5 text-xs font-medium text-accent hover:bg-surface-hover"
      >
        Estimate collection value
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-2xl shadow-black/50"
          >
            <div className="flex items-start justify-between">
              <h2 className="text-base font-semibold">Estimated collection value</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted hover:text-white"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <p className="text-3xl font-bold text-accent">{formatUSD(total)}</p>

            {breakdown.length > 0 ? (
              <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {breakdown.map((b) => (
                  <div key={b.format} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-neutral-300">
                      {b.count} {b.format}
                      {b.count === 1 ? "" : "s"}
                    </span>
                    <span className="text-muted">{formatUSD(b.subtotal)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Add some movies to see an estimate.</p>
            )}

            <p className="text-xs leading-relaxed text-muted">
              A rough estimate based on typical average prices per format — not real-time
              market or resale data.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
