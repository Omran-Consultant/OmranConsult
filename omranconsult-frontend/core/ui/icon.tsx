import type { ReactElement } from "react";

import { classNames } from "@/core/ui/class-names";

/*
 * One icon set (docs/DESIGN_BASELINE.md §1): 20×20 grid, stroke 1.5, currentColor.
 * The first group is copied from the Figma handoff (03-Assets/icons). The delivered
 * icons are drawn for this project (they are not Lucide), so the icons the design uses
 * but did not export are drawn here in the same style (PHASE4C Q8):
 * phone, map-pin, clock, drone, car, monitor, total-station, trending-up, list,
 * chevron-left, chevron-right, chevron-down, sun, moon, check, quote, plus, link,
 * mountain, send, target.
 */
const PATHS = {
  arrow: <path d="M14 6L6 14M6 14H12.5M6 14V7.5" />,
  bell: <path d="M5 8a5 5 0 0 1 10 0v4l1.5 2.5h-13L5 12V8ZM8 16.5a2 2 0 0 0 4 0" />,
  building: <path d="M3 17h14M5 17V6l5-3 5 3v11M8 17v-3h4v3M8 9h.01M12 9h.01" />,
  chart: <path d="M3 17h14M6 14V9M10 14V5M14 14v-3" />,
  close: <path d="M5 5l10 10M15 5L5 15" />,
  cog: (
    <>
      <circle cx="10" cy="10" r="2.5" />
      <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7" />
    </>
  ),
  dots: (
    <>
      <circle cx="5" cy="10" r="1" />
      <circle cx="10" cy="10" r="1" />
      <circle cx="15" cy="10" r="1" />
    </>
  ),
  edit: <path d="M4 16h3l8.5-8.5-3-3L4 13v3ZM11 6l3 3" />,
  eye: (
    <>
      <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z" />
      <circle cx="10" cy="10" r="2.5" />
    </>
  ),
  file: (
    <>
      <path d="M5 3h7l4 4v10H5V3Z" />
      <path d="M12 3v4h4M8 11h5M8 14h5" />
    </>
  ),
  filter: <path d="M3 5h14M6 10h8M8.5 15h3" />,
  globe: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c2 2 2.8 4.5 2.8 7s-.8 5-2.8 7c-2-2-2.8-4.5-2.8-7S8 5 10 3Z" />
    </>
  ),
  grid: (
    <>
      <rect height="6" rx="1.5" width="6" x="3" y="3" />
      <rect height="6" rx="1.5" width="6" x="11" y="3" />
      <rect height="6" rx="1.5" width="6" x="3" y="11" />
      <rect height="6" rx="1.5" width="6" x="11" y="11" />
    </>
  ),
  image: (
    <>
      <rect height="12" rx="2" width="14" x="3" y="4" />
      <circle cx="7.5" cy="8.5" r="1.5" />
      <path d="m3 14 4-3 3 2 3-3 4 4" />
    </>
  ),
  inbox: <path d="M3 11h4l1 2h4l1-2h4M4 5h12l1 6v5H3v-5l1-6Z" />,
  layers: <path d="m10 3 7 4-7 4-7-4 7-4ZM3 11l7 4 7-4" />,
  logout: <path d="M8 4H4v12h4M13 6l-4 4 4 4M9 10h8" />,
  mail: (
    <>
      <rect height="10" rx="2" width="14" x="3" y="5" />
      <path d="m3 6 7 5 7-5" />
    </>
  ),
  menu: <path d="M3 6h14M7 10h10M3 14h14" />,
  search: (
    <>
      <circle cx="9" cy="9" r="5.5" />
      <path d="m13 13 4 4" />
    </>
  ),
  trash: <path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10" />,
  upload: <path d="M10 13V4M6 8l4-4 4 4M4 13v3h12v-3" />,
  users: (
    <>
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 17c.5-3 2.8-4.5 5.5-4.5s5 1.5 5.5 4.5M13 4.5a2.5 2.5 0 0 1 0 5M15 12.5c1.4.5 2.3 1.9 2.5 4.5" />
    </>
  ),

  // Drawn for this project in the handoff style.
  phone: (
    <path d="M7 3H4.6A1.5 1.5 0 0 0 3.1 4.7 13 13 0 0 0 15.3 16.9a1.5 1.5 0 0 0 1.7-1.5V13l-3.4-1.4-1.9 1.9a9.5 9.5 0 0 1-5.2-5.2l1.9-1.9L7 3Z" />
  ),
  "map-pin": (
    <>
      <path d="M10 17.5s-5.5-4.6-5.5-9a5.5 5.5 0 0 1 11 0c0 4.4-5.5 9-5.5 9Z" />
      <circle cx="10" cy="8.5" r="2" />
    </>
  ),
  clock: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.5 2.5" />
    </>
  ),
  drone: (
    <>
      <rect height="4" rx="1" width="4" x="8" y="8" />
      <path d="M8 8 6.3 6.3M12 8l1.7-1.7M8 12l-1.7 1.7M12 12l1.7 1.7" />
      <circle cx="5" cy="5" r="2" />
      <circle cx="15" cy="5" r="2" />
      <circle cx="5" cy="15" r="2" />
      <circle cx="15" cy="15" r="2" />
    </>
  ),
  car: (
    <>
      <path d="M3.5 14V10l1.8-4.5h9.4L16.5 10v4M3 10h14M3.5 14h13" />
      <circle cx="6.5" cy="14.5" r="1.5" />
      <circle cx="13.5" cy="14.5" r="1.5" />
    </>
  ),
  monitor: (
    <>
      <rect height="10" rx="1.5" width="14" x="3" y="3.5" />
      <path d="M7.5 17h5M10 13.5V17" />
    </>
  ),
  "total-station": (
    <>
      <rect height="4" rx="1" width="6" x="7" y="3" />
      <path d="M10 7v3M10 10l-4.5 7.5M10 10l4.5 7.5M10 10v7.5" />
    </>
  ),
  "trending-up": <path d="m3 14 4.5-4.5 3 3L17 6M12.5 6H17v4.5" />,
  list: <path d="M8 6h9M8 10h9M8 14h9M4 6h.01M4 10h.01M4 14h.01" />,
  "chevron-left": <path d="M12.5 5 7.5 10l5 5" />,
  "chevron-right": <path d="m7.5 5 5 5-5 5" />,
  "chevron-down": <path d="m5 7.5 5 5 5-5" />,
  sun: (
    <>
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2.5V4M10 16v1.5M2.5 10H4M16 10h1.5M4.7 4.7l1.1 1.1M14.2 14.2l1.1 1.1M4.7 15.3l1.1-1.1M14.2 5.8l1.1-1.1" />
    </>
  ),
  moon: <path d="M16 12.5A6.5 6.5 0 0 1 7.5 4a6.5 6.5 0 1 0 8.5 8.5Z" />,
  check: <path d="m4.5 10.5 3.5 3.5 7.5-8" />,
  quote: (
    <path d="M4 14v-3.5C4 7.6 5.4 6 8 5.5M4 10.5h3.5V14H4M11 14v-3.5c0-2.9 1.4-4.5 4-5M11 10.5h3.5V14H11" />
  ),
  plus: <path d="M10 4v12M4 10h12" />,
  link: <path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.9.9M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.9-.9" />,
  mountain: (
    <>
      <path d="M2 16.5 6.8 9.5l2.6 3.2 2.8-5.2L17.8 16.5Z" />
      <path d="M12.2 7.5V3.4" />
      <path d="M12.2 3.4h3.6L14.3 5h-2.1" />
    </>
  ),
  send: (
    <>
      <path d="m2.8 9.4 14.4-6.6-5.8 14.4-2.4-5.6-6.2-2.2Z" />
      <path d="M8.8 11.8 17.2 2.8" />
    </>
  ),
  target: (
    <>
      <circle cx="10" cy="10" r="6.5" />
      <circle cx="10" cy="10" r="3.25" />
      <circle cx="10" cy="10" fill="currentColor" r="1" stroke="none" />
    </>
  ),
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof PATHS;

/** Narrows an icon key coming from the API (for example service highlights). */
export function isIconName(value: string): value is IconName {
  return Object.hasOwn(PATHS, value);
}

/** Icons whose direction carries meaning; drawn for RTL and mirrored in LTR. */
const DIRECTIONAL: ReadonlySet<IconName> = new Set(["arrow", "chevron-left", "chevron-right"]);

type IconProps = {
  readonly name: IconName;
  readonly className?: string;
  /** Accessible name; omit for decorative icons (the default). */
  readonly label?: string;
};

export function Icon({ name, className, label }: IconProps) {
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={classNames("size-5 shrink-0", DIRECTIONAL.has(name) && "flip-ltr", className)}
      fill="none"
      focusable="false"
      role={label ? "img" : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      {PATHS[name]}
    </svg>
  );
}
