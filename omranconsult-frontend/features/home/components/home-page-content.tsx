import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Card } from "@/core/ui/card";
import { Container } from "@/core/ui/container";
import { LinkButton } from "@/core/ui/button";
import { Section } from "@/core/ui/section";
import { getConfiguredPublicSiteOrigin } from "@/core/seo/locale-metadata";
import { JsonLd } from "@/core/seo/json-ld";
import { Stat } from "@/core/ui/stat";
import { ClientLogo } from "@/features/media/client-logo";
import {
  getProfileImageAlt,
  HERO_SLIDE_IMAGES,
} from "@/features/media/profile-images";
import { formatPhoneForDisplay, formatPhoneTelLink } from "@/core/format/phone";
import { formatStatisticValue } from "@/features/home/services/statistic-formatter";
import { ProjectOwnerLogo } from "@/features/media/project-owner-logo";
import type { AppLocale } from "@/i18n/routing";

type HomePageData = Awaited<
  ReturnType<typeof import("@/features/home/services/get-home-page-data").getHomePageData>
>;

type HomePageContentProps = {
  readonly locale: AppLocale;
  readonly data: HomePageData;
};

function asObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function firstBodyParagraph(value: unknown): string | undefined {
  const block = asObject(value);
  const body = block?.body;
  if (!Array.isArray(body) || body.length === 0) {
    return undefined;
  }
  return asString(body[0]);
}

export async function HomePageContent({ locale, data }: HomePageContentProps) {
  const t = await getTranslations("HomePage");
  const slidesByKey = new Map(data.home.heroSlides.map((slide) => [slide.key, slide]));
  const blocks = data.home.blocks;
  const aboutBlock = asObject(blocks.about);
  const strategyBlock = asObject(blocks.strategy);
  const sectionTitles = asObject(blocks.section_titles);
  const heroSlide = slidesByKey.get("hero");
  const coverSlide = slidesByKey.get("cover");
  const axisServices = data.services.filter((category) => category.kind === "axis");
  const listedClients = data.clients.filter((client) => client.inClientList);
  const licensesCount = data.documents.filter((doc) => doc.kind === "license").length;
  const certificatesCount = data.documents.filter((doc) => doc.kind === "iso_certificate").length;
  const siteOrigin = getConfiguredPublicSiteOrigin() ?? "http://localhost:3000";
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.settings.companyLegalName ?? coverSlide?.headline,
    url: `${siteOrigin}/${locale}`,
    email: data.settings.contact.email,
    telephone: data.settings.contact.phones[0],
  };

  return (
    <main className="flex flex-1 flex-col">
      <JsonLd data={organizationJsonLd} />
      <section className="relative overflow-hidden bg-brand-navy text-white">
        <Image
          alt={getProfileImageAlt(HERO_SLIDE_IMAGES.hero, locale)}
          className="absolute inset-0 h-full w-full object-cover opacity-35"
          height={HERO_SLIDE_IMAGES.hero.height}
          priority
          sizes="100vw"
          src={HERO_SLIDE_IMAGES.hero.src}
          width={HERO_SLIDE_IMAGES.hero.width}
        />
        <div className="absolute inset-0 bg-brand-navy/60" />
        <Container className="relative space-y-6 py-24 md:py-32">
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-muted-on-dark">
            {coverSlide?.headline}
          </p>
          <h1 className="font-display max-w-2xl text-4xl font-semibold md:text-6xl">
            {heroSlide?.headline}
          </h1>
          {heroSlide?.subline ? <p className="max-w-2xl text-xl text-muted-on-dark">{heroSlide.subline}</p> : null}
          <LinkButton href="/#contact">{t("contactCta")}</LinkButton>
        </Container>
      </section>

      <Section heading={asString(sectionTitles?.statistics)} tone="light">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {data.home.statistics.map((stat) => (
            <Card key={stat.key}>
              <Stat
                label={stat.label}
                unit={stat.unit}
                value={formatStatisticValue({
                  value: stat.value,
                  locale,
                  scale: stat.scale,
                  suffix: stat.suffix,
                })}
              />
            </Card>
          ))}
        </div>
      </Section>

      <Section
        heading={asString(aboutBlock?.heading)}
        tone="light"
      >
        <p className="max-w-4xl text-lg text-muted">{firstBodyParagraph(blocks.about)}</p>
        <LinkButton href="/about" variant="outline">
          {t("aboutCta")}
        </LinkButton>
      </Section>

      <Section heading={slidesByKey.get("vision")?.headline} tone="dark">
        <div className="grid gap-6 md:grid-cols-3">
          {(["vision", "mission", "objectives"] as const).map((key) => {
            const block = asObject(strategyBlock?.[key]);
            return (
              <Card className="bg-white/5 text-white" key={key}>
                <h3 className="font-display text-2xl font-semibold">{asString(block?.title)}</h3>
                <p className="mt-3 text-muted-on-dark">{asString(block?.body)}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section heading={slidesByKey.get("services")?.headline} tone="light">
        <div className="grid gap-6 md:grid-cols-3">
          {axisServices.map((category) => (
            <Card key={category.slug}>
              <h3 className="font-display text-xl font-semibold text-heading">{category.title}</h3>
              <ul className="mt-3 space-y-2 text-muted">
                {category.services.slice(0, 4).map((service) => (
                  <li key={service.slug}>- {service.title}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <LinkButton href="/services" variant="outline">
          {t("servicesCta")}
        </LinkButton>
      </Section>

      <Section heading={slidesByKey.get("projects")?.headline ?? asString(sectionTitles?.featured_projects)} tone="light">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.projects.projects.map((project) => (
            <Card key={project.slug}>
              {project.client ? (
                <ProjectOwnerLogo
                  locale={locale}
                  name={project.client.name}
                  slug={project.client.slug}
                />
              ) : null}
              <h3 className="font-display text-lg font-semibold text-heading">{project.title}</h3>
              {project.client?.name ? <p className="mt-2 text-sm text-muted">{project.client.name}</p> : null}
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <Image
              alt={t("mapAlt")}
              className="h-auto w-full rounded-md"
              height={482}
              sizes="(max-width: 1024px) 100vw, 50vw"
              src="/images/profile/ksa-map.png"
              width={672}
            />
          </Card>
          <Card>
            <div className="flex flex-wrap gap-2">
              {data.regions.map((region) => (
                <span className="rounded-full bg-surface-muted px-3 py-1 text-sm text-muted" key={region.slug}>
                  {region.name ?? region.slug}
                </span>
              ))}
            </div>
          </Card>
        </div>
        <LinkButton href="/projects" variant="outline">
          {t("projectsCta")}
        </LinkButton>
      </Section>

      <Section tone="gradient">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white/10 text-white">
            <p className="font-display text-3xl font-semibold">{licensesCount}</p>
            <p className="text-muted-on-dark">{t("licensesCount")}</p>
          </Card>
          <Card className="bg-white/10 text-white">
            <p className="font-display text-3xl font-semibold">{certificatesCount}</p>
            <p className="text-muted-on-dark">{t("certificatesCount")}</p>
          </Card>
          <Card className="bg-white/10 text-white">
            <p className="font-display text-3xl font-semibold">{data.partners.length}</p>
            <p className="text-muted-on-dark">{t("partnersCount")}</p>
          </Card>
        </div>
        <p className="text-muted-on-dark">
          {t("clientsCount", { count: listedClients.length })}
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {listedClients.map((client) => (
            <ClientLogo
              key={client.sortOrder}
              locale={locale}
              name={client.name}
              slug={client.slug}
              sortOrder={client.sortOrder}
            />
          ))}
        </div>
      </Section>

      <Section heading={asString(sectionTitles?.experts)} tone="light">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.experts.map((expert) => (
            <Card key={expert.slug}>
              <h3 className="font-display text-xl font-semibold text-heading">{expert.name}</h3>
              <p className="mt-2 text-muted">{expert.title}</p>
            </Card>
          ))}
        </div>
        <LinkButton href="/about#experts" variant="outline">
          {t("expertsCta")}
        </LinkButton>
      </Section>

      <Section id="contact" heading={t("contactHeading")} tone="dark">
        <p className="max-w-3xl text-muted-on-dark">{data.settings.companyLegalName}</p>
        <div className="space-y-2 text-muted-on-dark">
          {data.settings.contact.address ? <p>{data.settings.contact.address}</p> : null}
          {data.settings.contact.postal ? <p>{data.settings.contact.postal}</p> : null}
          {data.settings.contact.email ? (
            <p dir="ltr">
              <a className="hover:text-brand-green-light" href={`mailto:${data.settings.contact.email}`}>
                {data.settings.contact.email}
              </a>
            </p>
          ) : null}
          {data.settings.contact.phones.map((phone) => (
            <p dir="ltr" key={phone}>
              <a className="hover:text-brand-green-light" href={`tel:${formatPhoneTelLink(phone)}`}>
                {formatPhoneForDisplay(phone)}
              </a>
            </p>
          ))}
        </div>
      </Section>
    </main>
  );
}
