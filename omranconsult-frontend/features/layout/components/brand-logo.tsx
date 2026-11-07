import Image from "next/image";

import { classNames } from "@/core/ui/class-names";

const LOGO_WIDTH = 960;
const LOGO_HEIGHT = 378;

type BrandLogoProps = {
  readonly alt: string;
  readonly className: string;
  /** `adaptive`: dark logo on light surfaces, white logo on dark ones. `onDark`: always white. */
  readonly surface: "adaptive" | "onDark";
  readonly priority?: boolean;
};

/** Vector logo from the Figma handoff (A28). Sizes: 150 header, 180 footer, 110 mobile. */
export function BrandLogo({ alt, className, surface, priority = false }: BrandLogoProps) {
  if (surface === "onDark") {
    return (
      <Image alt={alt} className={className} height={LOGO_HEIGHT} priority={priority} src="/images/brand/logo-white.svg" width={LOGO_WIDTH} />
    );
  }

  return (
    <>
      <Image
        alt={alt}
        className={classNames(className, "on-dark:hidden")}
        height={LOGO_HEIGHT}
        priority={priority}
        src="/images/brand/logo-dark.svg"
        width={LOGO_WIDTH}
      />
      <Image
        alt={alt}
        className={classNames(className, "hidden on-dark:block")}
        height={LOGO_HEIGHT}
        priority={priority}
        src="/images/brand/logo-white.svg"
        width={LOGO_WIDTH}
      />
    </>
  );
}
