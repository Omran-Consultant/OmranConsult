import Image from "next/image";

import { PROFILE_IMAGES, getProfileImageAlt } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

type OfferingItem = {
  readonly title?: string;
};

type ServicesOfferingsSectionProps = {
  readonly locale: AppLocale;
  readonly coreTitle?: string;
  readonly coreItems: readonly OfferingItem[];
  readonly flexibleTitle?: string;
  readonly flexibleItems: readonly OfferingItem[];
};

export function ServicesOfferingsSection({
  coreItems,
  coreTitle,
  flexibleItems,
  flexibleTitle,
  locale,
}: ServicesOfferingsSectionProps) {
  const photo = PROFILE_IMAGES.engineerSkyline;

  return (
    <section
      className="grid gap-12 px-(--oc-page-margin) py-(--oc-section-y) lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
      data-section="offerings"
    >
      <div className="relative min-h-[32.5rem] overflow-hidden rounded-(--oc-radius-brand) bg-brand-navy-deep text-white">
        <Image
          alt={getProfileImageAlt(photo, locale)}
          className="object-cover"
          fill
          sizes="(max-width: 1024px) 100vw, 58vw"
          src={photo.src}
        />
        <div aria-hidden className="absolute inset-0 bg-brand-navy-deep/55" />
        <div className="relative z-1 flex h-full flex-col gap-5 p-7 md:p-10">
          {coreTitle ? (
            <h2 className="font-display text-[clamp(1.75rem,2.6vw,2.5rem)] leading-tight font-bold text-brand-green-light">
              {coreTitle}
            </h2>
          ) : null}
          <ul className="grid gap-3.5 sm:grid-cols-2">
            {coreItems.map((item, index) => (
              <li className="text-lg font-medium" key={`${item.title ?? "core"}-${index}`}>
                {item.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col justify-center gap-5">
        {flexibleTitle ? (
          <h2 className="font-display text-[clamp(1.75rem,2.6vw,2.5rem)] leading-tight font-bold text-heading">
            {flexibleTitle}
          </h2>
        ) : null}
        <ul className="flex flex-col gap-2">
          {flexibleItems.map((item, index) => (
            <li
              className="rounded-(--oc-radius-brand) bg-surface/55 px-5.5 py-4 text-lg font-bold text-heading motion-safe:transition-[background-color,transform] motion-safe:duration-300 motion-safe:hover:-translate-x-1.5 motion-safe:hover:bg-surface"
              key={`${item.title ?? "flex"}-${index}`}
            >
              {item.title}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
