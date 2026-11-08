import { getImageProps } from "next/image";

import { classNames } from "@/core/ui/class-names";
import { annularSectorPath } from "@/features/home/lib/annular-sector";

/*
 * Figma Home "Hero" ellipses, decoded from OMRAN.fig (arcData: start/end angle in radians,
 * inner radius ratio). Positions are relative to the 1440 (desktop) or 390 (mobile) frame.
 */
const DESKTOP = {
  box: 1180,
  outer: { start: -1.2, end: 3.6, inner: 0.8 },
  inner: { offset: 180, size: 820, start: -1, end: 3.3, inner: 0.62 },
  line: { inner: 0.995 },
};

const MOBILE = {
  box: 620,
  outer: { start: -1.3, end: 3, inner: 0.8 },
  inner: { offset: 100, size: 420, start: -1.1, end: 2.8, inner: 0.62 },
  line: undefined,
};

type Composition = typeof DESKTOP | typeof MOBILE;

function Rings({ composition, href, id, mirror, className }: {
  readonly composition: Composition;
  readonly href: string;
  readonly id: string;
  readonly mirror: boolean;
  readonly className: string;
}) {
  const { box, outer, inner, line } = composition;
  // In LTR the shapes mirror to the other side; the photo itself is never flipped.
  const flipOuter = mirror ? `matrix(-1 0 0 1 ${box} 0)` : undefined;
  const flipInner = mirror ? `translate(${inner.offset} ${inner.offset}) matrix(-1 0 0 1 ${inner.size} 0)` : `translate(${inner.offset} ${inner.offset})`;

  return (
    <svg aria-hidden="true" className={classNames("pointer-events-none absolute -z-10 aspect-square animate-ring-in", className)} focusable="false" viewBox={`0 0 ${box} ${box}`}>
      <defs>
        <clipPath id={`${id}-outer`}>
          <path d={annularSectorPath(box, outer.start, outer.end, outer.inner)} transform={flipOuter} />
        </clipPath>
        <clipPath id={`${id}-inner`}>
          <path d={annularSectorPath(inner.size, inner.start, inner.end, inner.inner)} transform={flipInner} />
        </clipPath>
      </defs>
      <image clipPath={`url(#${id}-outer)`} height={box} href={href} preserveAspectRatio="xMidYMid slice" width={box} />
      <image
        clipPath={`url(#${id}-inner)`}
        height={inner.size}
        href={href}
        preserveAspectRatio="xMidYMid slice"
        width={inner.size}
        x={inner.offset}
        y={inner.offset}
      />
      {line ? <path className="fill-accent" d={annularSectorPath(box, outer.start, outer.end, line.inner)} transform={flipOuter} /> : null}
    </svg>
  );
}

/**
 * Decorative hero rings: the earth photo in two concentric arcs with an angular gap (the sharp
 * crescent) and, on desktop, the accent arc line. Desktop keeps the 1440 positions and scales
 * with the viewport below 1440; mobile (< 1024) uses the 390 composition.
 */
export function HeroRings({ src, direction }: { readonly src: string; readonly direction: "rtl" | "ltr" }) {
  const { props } = getImageProps({ alt: "", src, width: 1920, height: 960, quality: 60, sizes: "1920px" });
  const mirror = direction === "ltr";

  return (
    <>
      <Rings
        className="hidden end-[max(-500px,-34.722vw)] top-[max(-120px,-8.333vw)] w-[min(1180px,81.944vw)] lg:block"
        composition={DESKTOP}
        href={props.src}
        id="hero-rings-desktop"
        mirror={mirror}
      />
      <Rings className="-end-10 -top-30 w-155 lg:hidden" composition={MOBILE} href={props.src} id="hero-rings-mobile" mirror={mirror} />
    </>
  );
}
