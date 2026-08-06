import type { MovieFormat } from "@/lib/firebase/types";

const COLORS: Record<MovieFormat, string> = {
  DVD: "bg-slate-600",
  "Blu-ray": "bg-blue-600",
  "4K UHD": "bg-purple-600",
  Digital: "bg-emerald-600",
};

export function FormatBadge({ format }: { format: MovieFormat }) {
  return (
    <span
      className={`${COLORS[format]} text-white text-xs font-medium px-2 py-0.5 rounded`}
    >
      {format}
    </span>
  );
}
