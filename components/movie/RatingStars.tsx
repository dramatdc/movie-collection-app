"use client";

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
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(value === star ? null : star)}
          className={`text-lg leading-none ${
            value !== null && star <= value ? "text-amber-400" : "text-neutral-600"
          } ${onChange ? "cursor-pointer" : "cursor-default"}`}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
