import Image from "next/image";

import { getPartnerLogo } from "./brand-logos";

type PartnerLogoProps = {
  readonly slug: string | null | undefined;
  readonly name: string | null | undefined;
  readonly className?: string;
};

export function PartnerLogo({ className, name, slug }: PartnerLogoProps) {
  const logo = getPartnerLogo(slug);
  if (!logo) {
    return null;
  }

  const boxClassName = className
    ? `flex min-h-28 items-center justify-center rounded-xl bg-canvas p-4 ${className}`
    : "flex min-h-28 items-center justify-center rounded-xl bg-canvas p-4";

  return (
    <div className={boxClassName}>
      <Image
        alt={name ?? slug ?? "Partner logo"}
        className="max-h-20 w-full object-contain"
        height={logo.height}
        sizes="(max-width: 768px) 45vw, 220px"
        src={logo.src}
        width={logo.width}
      />
    </div>
  );
}
