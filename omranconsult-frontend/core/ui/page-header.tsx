import Image from "next/image";
import type { ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { Container } from "@/core/ui/container";
import type { ProfileImage } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

type PageHeaderProps = {
  readonly title: string;
  readonly description?: string;
  readonly image: ProfileImage;
  readonly locale: AppLocale;
  readonly actions?: ReactNode;
  readonly className?: string;
};

export function PageHeader({
  title,
  description,
  image,
  locale,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header className={classNames("relative overflow-hidden bg-brand-navy text-white", className)}>
      <Image
        alt={image.alt[locale]}
        className="absolute inset-0 h-full w-full object-cover opacity-30"
        height={image.height}
        sizes="100vw"
        src={image.src}
        width={image.width}
      />
      <div className="absolute inset-0 bg-brand-navy/50" />
      <Container className="relative space-y-4 py-16 md:py-24">
        <h1 className="font-display text-3xl font-semibold md:text-5xl">{title}</h1>
        {description ? <p className="max-w-3xl text-lg text-muted-on-dark">{description}</p> : null}
        {actions}
      </Container>
    </header>
  );
}
