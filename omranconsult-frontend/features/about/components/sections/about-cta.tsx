import { AnchorButton, LinkButton } from "@/core/ui/button";
import { CtaBox } from "@/core/ui/cta-box";
import type { AboutView } from "@/features/about/services/get-about-page-data";

/** Figma About "CTA": the shared CTA box and copy. */
export function AboutCta({ view }: { readonly view: AboutView }) {
  const cta = view.homeCopy.cta;
  if (!cta.title) {
    return null;
  }

  return (
    <section aria-labelledby="about-cta-title" className="bg-canvas pb-16 lg:pt-10 lg:pb-20" data-section="cta">
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
          image={view.images.cta}
          text={cta.text}
          textShort={cta.text_short}
          title={cta.title}
          titleId="about-cta-title"
        />
      </div>
    </section>
  );
}
