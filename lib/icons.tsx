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
