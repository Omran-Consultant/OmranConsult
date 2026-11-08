import { getImageProps } from "next/image";
import type { CSSProperties } from "react";
import { preload } from "react-dom";

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

/** Mask image (SVG data URI) for one annular sector drawn in a `size`×`size` box. */
function sectorMask(size: number, start: number, end: number, inner: number, mirror: boolean): string {
  const flip = mirror ? ` transform="matrix(-1 0 0 1 ${size} 0)"` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><path d="${annularSectorPath(size, start, end, inner)}"${flip}/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function photoLayer(href: string, mask: string): CSSProperties {
  return { backgroundImage: `url("${href}")`, maskImage: mask, maskSize: "100% 100%", WebkitMaskImage: mask, WebkitMaskSize: "100% 100%" };
}

/*
 * The photo is a masked background, not an SVG <image>: browsers skip backgrounds of hidden
 * elements, so each breakpoint downloads only its own size (Home LCP on mobile).
 */
function Rings({ composition, href, mirror, className }: {
  readonly composition: Composition;
  readonly href: string;
  readonly mirror: boolean;
  readonly className: string;
}) {
  const { box, outer, inner, line } = composition;
  const inset = `${(inner.offset / box) * 100}%`;

  return (
    <div aria-hidden="true" className={classNames("pointer-events-none absolute -z-10 aspect-square animate-ring-in", className)}>
      <span className="absolute inset-0 bg-cover bg-center" style={photoLayer(href, sectorMask(box, outer.start, outer.end, outer.inner, mirror))} />
      <span
        className="absolute bg-cover bg-center"
        style={{ inset, ...photoLayer(href, sectorMask(inner.size, inner.start, inner.end, inner.inner, mirror)) }}
      />
      {line ? (
        <svg className="absolute inset-0 size-full" focusable="false" viewBox={`0 0 ${box} ${box}`}>
          <path
            className="fill-accent"
            d={annularSectorPath(box, outer.start, outer.end, line.inner)}
            transform={mirror ? `matrix(-1 0 0 1 ${box} 0)` : undefined}
          />
        </svg>
      ) : null}
    </div>
  );
}

/**
 * Decorative hero rings: the earth photo in two concentric arcs with an angular gap (the sharp
 * crescent) and, on desktop, the accent arc line. Desktop keeps the 1440 positions and scales
 * with the viewport below 1440; mobile (< 1024) uses the 390 composition.
 */
export function HeroRings({ src, direction }: { readonly src: string; readonly direction: "rtl" | "ltr" }) {
  const { props } = getImageProps({ alt: "", src, width: 1920, height: 960, quality: 60, sizes: "1920px" });
  // The mobile box is 620 CSS px: a fixed-width source keeps phones off the 3840 px variant.
  const { props: mobileProps } = getImageProps({ alt: "", src, width: 600, height: 300, quality: 60 });
  const mirror = direction === "ltr";

  preload(props.src, { as: "image", fetchPriority: "high", media: "(min-width: 1024px)" });
  preload(mobileProps.src, { as: "image", fetchPriority: "high", media: "(max-width: 1023.98px)" });

  return (
    <>
      <Rings
        className="hidden end-[max(-500px,-34.722vw)] top-[max(-120px,-8.333vw)] w-[min(1180px,81.944vw)] lg:block"
        composition={DESKTOP}
        href={props.src}
        mirror={mirror}
      />
      <Rings className="-end-10 -top-30 w-155 lg:hidden" composition={MOBILE} href={mobileProps.src} mirror={mirror} />
    </>
  );
}
