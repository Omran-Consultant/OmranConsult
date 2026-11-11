import Image from "next/image";

import { classNames } from "@/core/ui/class-names";

const LOGO_WIDTH = 960;
const LOGO_HEIGHT = 378;

type BrandLogoProps = {
  readonly alt: string;
  readonly className: string;
  /** `adaptive`: dark logo on light surfaces, white logo on dark ones. `onDark`: always white. */
  readonly surface: "adaptive" | "onDark";
  /** The header copy, the usual LCP: high fetch priority (Next 16 deprecates `priority`). */
  readonly priority?: boolean;
};

/** Vector logo from the Figma handoff (A28). Sizes: 150 header, 180 footer, 110 mobile. */
export function BrandLogo({ alt, className, surface, priority = false }: BrandLogoProps) {
  // Always eager: the header, menu and footer share these few-KB files, and Next keys its LCP
  // check by URL, so one lazy copy flags the header logo when it is the LCP.
  const loading = priority ? ({ fetchPriority: "high", loading: "eager" } as const) : ({ loading: "eager" } as const);

  if (surface === "onDark") {
    return (
      <Image alt={alt} className={className} height={LOGO_HEIGHT} {...loading} src="/images/brand/logo-white.svg" width={LOGO_WIDTH} />
    );
  }

  return (
    <>
      <Image
        alt={alt}
        className={classNames(className, "on-dark:hidden")}
        height={LOGO_HEIGHT}
        {...loading}
        src="/images/brand/logo-dark.svg"
        width={LOGO_WIDTH}
      />
      <Image
        alt={alt}
        className={classNames(className, "hidden on-dark:block")}
        height={LOGO_HEIGHT}
        {...loading}
        src="/images/brand/logo-white.svg"
        width={LOGO_WIDTH}
      />
    </>
  );
}
