"use client";

import { StarIcon } from "@/lib/icons";

export function RatingStars({
  value,
  onChange,
}: {
  value: number | null;
  onChange?: (rating: number | null) => void;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-1">
      {stars.map((star) => {
        const filled = value !== null && star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={!onChange}
            onClick={() => onChange?.(value === star ? null : star)}
            className={onChange ? "cursor-pointer" : "cursor-default"}
            aria-label={`${star} star`}
          >
            <StarIcon
              className={`h-4.5 w-4.5 ${filled ? "text-accent" : "text-border"}`}
              fill={filled ? "currentColor" : "none"}
            />
          </button>
        );
      })}
    </div>
  );
}
