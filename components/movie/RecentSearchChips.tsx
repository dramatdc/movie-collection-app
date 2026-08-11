export function RecentSearchChips({
  recent,
  onSelect,
}: {
  recent: string[];
  onSelect: (query: string) => void;
}) {
  if (recent.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted">Recent:</span>
      {recent.map((q) => (
        <button
          key={q}
          type="button"
          onClick={() => onSelect(q)}
          className="rounded-full border border-border bg-canvas px-2.5 py-1 text-xs text-muted hover:border-accent hover:text-accent"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
