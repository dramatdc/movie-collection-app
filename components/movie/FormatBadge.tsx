import type { MovieFormat } from "@/lib/firebase/types";

const STYLES: Record<MovieFormat, string> = {
  DVD: "bg-surface-hover text-muted border border-border",
  "Blu-ray": "bg-accent text-accent-foreground",
  "4K UHD": "bg-[#005f8a] text-accent-foreground",
  Digital: "bg-transparent text-accent border border-accent",
};

export function FormatBadge({ format }: { format: MovieFormat }) {
  return (
    <span
      className={`${STYLES[format]} text-xs font-medium px-2 py-0.5 rounded`}
    >
      {format}
    </span>
  );
}
