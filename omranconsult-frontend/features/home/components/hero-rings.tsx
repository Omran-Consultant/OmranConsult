import { getImageProps } from "next/image";
import type { CSSProperties } from "react";

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

/** `getImageProps().src` is the largest srcset entry (often 3840). Pick a display-sized URL instead. */
function srcNear(srcSet: string | undefined, fallback: string, target: number): string {
  if (!srcSet) {
    return fallback;
  }

  let best = fallback;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const part of srcSet.split(",")) {
    const [url, descriptor] = part.trim().split(/\s+/);
    const width = Number.parseInt(descriptor ?? "", 10);
    if (!url || !Number.isFinite(width)) {
      continue;
    }
    const delta = Math.abs(width - target);
    if (delta < bestDelta) {
      best = url;
      bestDelta = delta;
    }
  }
  return best;
}

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
 * Masked CSS backgrounds: hidden copies do not download, and Lighthouse scored this
 * higher than a masked <img> (Home LCP). Each breakpoint still gets its own sized URL.
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
    <div aria-hidden="true" className={classNames("pointer-events-none absolute -z-10 aspect-square motion-safe:animate-ring-in", className)} data-hero-ring="">
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
 * with the viewport below 1440; mobile (< 1024) uses the 390 composition. Between 1024 and 1439
 * the ring is shifted so its visible edge stops 16 px short of the 680 px text column (page
 * margin included); at 1440 that calculation lands on the design position.
 */
export function HeroRings({ src, direction }: { readonly src: string; readonly direction: "rtl" | "ltr" }) {
  const desktop = getImageProps({ alt: "", src, width: 1920, height: 960, quality: 40, sizes: "1180px" });
  const mobile = getImageProps({ alt: "", src, width: 640, height: 320, quality: 40, sizes: "620px" });
  const desktopHref = srcNear(desktop.props.srcSet, desktop.props.src, 1200);
  const mobileHref = srcNear(mobile.props.srcSet, mobile.props.src, 750);
  const mirror = direction === "ltr";

  return (
    <>
      <link as="image" fetchPriority="high" href={mobileHref} media="(max-width: 1023px)" rel="preload" />
      <link as="image" href={desktopHref} media="(min-width: 1024px)" rel="preload" />
      <Rings
        className="hidden end-[calc(18.056vw-696px-var(--page-margin))] top-[max(-120px,-8.333vw)] w-[min(1180px,81.944vw)] min-[1440px]:end-[max(-500px,-34.722vw)] lg:block"
        composition={DESKTOP}
        href={desktopHref}
        mirror={mirror}
      />
      <Rings className="-end-10 -top-30 w-155 lg:hidden" composition={MOBILE} href={mobileHref} mirror={mirror} />
    </>
  );
}
