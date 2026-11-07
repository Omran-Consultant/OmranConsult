import { PageHeader } from "@/core/ui/page-header";
import { SECTION_BACKGROUND_IMAGES } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

type AboutHeaderSectionProps = {
  readonly locale: AppLocale;
  readonly title: string;
  readonly subline?: string;
};

export function AboutHeaderSection({ locale, subline, title }: AboutHeaderSectionProps) {
  return (
    <div data-section="header">
      <PageHeader
        description={subline}
        image={SECTION_BACKGROUND_IMAGES.about}
        locale={locale}
        title={title}
      />
    </div>
  );
}
