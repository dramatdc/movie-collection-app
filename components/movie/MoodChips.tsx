"use client";

import clsx from "clsx";

export function MoodChips({
  genres,
  selected,
  onChange,
}: {
  genres: string[];
  selected: string[];
  onChange: (genres: string[]) => void;
}) {
  function toggle(genre: string) {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  }

  if (genres.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">
        In the mood for something specific? {selected.length > 0 && "(tap to clear)"}
      </p>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => {
          const active = selected.includes(genre);
          return (
            <button
              key={genre}
              type="button"
              onClick={() => toggle(genre)}
              className={clsx(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                active
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface text-muted hover:bg-surface-hover"
              )}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
