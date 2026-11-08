import { AnchorButton, LinkButton } from "@/core/ui/button";
import { CtaBox } from "@/core/ui/cta-box";
import type { HomeView } from "@/features/home/services/home-view";
import { SITE_IMAGES, toImageAsset } from "@/features/media/profile-images";

/** Figma Home "CTA": night photo, «اطلب استشارة» → /contact, profile download (hidden when null). */
export function HomeCta({ view }: { readonly view: HomeView }) {
  const { cta } = view.copy;

  if (!cta.title) {
    return null;
  }

  return (
    <section aria-labelledby="home-cta-title" className="bg-canvas pt-0 pb-16 lg:pt-10 lg:pb-20" data-section="cta">
      <div className="container-page" data-reveal="">
        <CtaBox
          actions={
            <>
              {cta.primary ? (
                <LinkButton arrow href="/contact">
                  {cta.primary}
                </LinkButton>
              ) : null}
              {cta.secondary && view.profilePdfUrl ? (
                <AnchorButton arrow className="max-md:hidden" download href={view.profilePdfUrl} rel="noopener" target="_blank" variant="light">
                  {cta.secondary}
                </AnchorButton>
              ) : null}
            </>
          }
          image={toImageAsset(SITE_IMAGES.night, view.locale)}
          text={cta.text}
          title={cta.title}
          titleId="home-cta-title"
        />
      </div>
    </section>
  );
}
