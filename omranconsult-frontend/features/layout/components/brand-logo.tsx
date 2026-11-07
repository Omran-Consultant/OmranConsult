import Image from "next/image";

const LOGO_WIDTH = 451;
const LOGO_HEIGHT = 165;

type BrandLogoProps = {
  readonly alt: string;
  readonly className: string;
  /** `adaptive`: navy logo on light surfaces, white logo in dark mode. `onDark`: always white. */
  readonly surface: "adaptive" | "onDark";
  readonly priority?: boolean;
};

export function BrandLogo({ alt, className, surface, priority = false }: BrandLogoProps) {
  if (surface === "onDark") {
    return (
      <Image
        alt={alt}
        className={className}
        height={LOGO_HEIGHT}
        priority={priority}
        src="/images/brand/logo-white.svg"
        width={LOGO_WIDTH}
      />
    );
  }

  return (
    <>
      <Image
        alt={alt}
        className={`${className} dark:hidden`}
        height={LOGO_HEIGHT}
        priority={priority}
        src="/images/brand/logo-dark.svg"
        width={LOGO_WIDTH}
      />
      <Image
        alt={alt}
        className={`${className} hidden dark:block`}
        height={LOGO_HEIGHT}
        src="/images/brand/logo-white.svg"
        width={LOGO_WIDTH}
      />
    </>
  );
}
