import type { MovieFormat, OwnedMovie } from "@/lib/firebase/types";

// There's no real pricing API wired up here (that'd need a paid data
// source, which doesn't fit a free app) — these are rough, generic
// estimates of what each format typically goes for, not an appraisal of
// any specific title.
export const ESTIMATED_FORMAT_VALUE: Record<MovieFormat, number> = {
  DVD: 3,
  "Blu-ray": 8,
  "4K UHD": 15,
  Digital: 12,
};

export interface CollectionValueBreakdown {
  format: MovieFormat;
  count: number;
  subtotal: number;
}

export function estimateCollectionValue(movies: OwnedMovie[]): {
  total: number;
  breakdown: CollectionValueBreakdown[];
} {
  const counts = new Map<MovieFormat, number>();
  for (const m of movies) {
    counts.set(m.format, (counts.get(m.format) ?? 0) + 1);
  }

  const breakdown = (Object.keys(ESTIMATED_FORMAT_VALUE) as MovieFormat[])
    .map((format) => {
      const count = counts.get(format) ?? 0;
      return { format, count, subtotal: count * ESTIMATED_FORMAT_VALUE[format] };
    })
    .filter((b) => b.count > 0);

  const total = breakdown.reduce((sum, b) => sum + b.subtotal, 0);
  return { total, breakdown };
}
