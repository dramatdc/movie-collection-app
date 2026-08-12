import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function LibraryIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4" width="7" height="16" rx="1" />
      <rect x="14" y="4" width="7" height="16" rx="1" />
      <line x1="6.5" y1="8" x2="6.5" y2="8.01" />
      <line x1="17.5" y1="8" x2="17.5" y2="8.01" />
    </svg>
  );
}

export function ListIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

export function AddIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

export function ShuffleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 6h3.5c2.5 0 3.8 1.8 5 4" />
      <path d="M3 18h3.5c2.5 0 3.8-1.8 5-4" />
      <path d="M13.5 10c1.2-2.2 2.5-4 5-4H21" />
      <path d="M13.5 14c1.2 2.2 2.5 4 5 4H21" />
      <polyline points="18 3 21 6 18 9" />
      <polyline points="18 15 21 18 18 21" />
    </svg>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c1.2-3.8 4-5.5 7-5.5s5.8 1.7 7 5.5" />
    </svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8h3l1.6-2h6.8L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="20" y2="20" />
    </svg>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3.5h12a.5.5 0 0 1 .5.5v17l-6.5-4-6.5 4v-17a.5.5 0 0 1 .5-.5Z" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v12" />
      <polyline points="8 7 12 3 16 7" />
      <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <polyline points="9 5 16 12 9 19" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <polygon points="12 3 14.8 9 21.3 9.8 16.6 14.2 17.9 20.7 12 17.5 6.1 20.7 7.4 14.2 2.7 9.8 9.2 9 12 3" />
    </svg>
  );
}

// Brand marks for third-party sign-in buttons — these follow Google's and
// Apple's own logo colors/shapes rather than the app's stroke icon style,
// since both providers require their official mark to be used as-is.
export function GoogleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.87Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.27a12 12 0 0 0 0 10.8l4-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
      />
    </svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.36 1.06c.1 1-.28 1.98-.87 2.72-.62.78-1.63 1.38-2.62 1.3-.12-.97.34-1.99.92-2.68.65-.78 1.72-1.36 2.57-1.34ZM19.9 17.32c-.36.84-.79 1.62-1.32 2.36-.72 1.01-1.31 1.71-1.76 2.1-.7.65-1.44.99-2.24 1.01-.57.01-1.26-.16-2.06-.5-.8-.34-1.53-.5-2.2-.5-.7 0-1.45.16-2.26.5-.81.34-1.46.52-1.96.54-.76.03-1.52-.32-2.28-1.04-.49-.43-1.11-1.16-1.86-2.2-.8-1.11-1.46-2.4-1.98-3.87-.56-1.59-.84-3.12-.84-4.6 0-1.7.37-3.16 1.1-4.39a6.46 6.46 0 0 1 2.31-2.35 6.2 6.2 0 0 1 3.13-.89c.61 0 1.42.19 2.44.57 1.01.38 1.66.57 1.95.57.22 0 .94-.22 2.16-.66 1.15-.41 2.13-.58 2.92-.51 2.16.17 3.78 1.03 4.86 2.57-1.93 1.17-2.89 2.81-2.87 4.9.02 1.63.6 2.99 1.75 4.06.52.5 1.1.88 1.75 1.16-.14.41-.29.8-.46 1.19Z" />
    </svg>
  );
}
