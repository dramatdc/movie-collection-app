import clsx from "clsx";

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <p className="text-sm text-neutral-200">{label}</p>
        {description && <p className="text-xs text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={clsx(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-accent" : "bg-surface-hover"
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200",
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}
