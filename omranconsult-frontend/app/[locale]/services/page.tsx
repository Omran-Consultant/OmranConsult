import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ServicesPageContent } from "@/features/services/components/services-page-content";
import { getServicesPageData } from "@/features/services/services/get-services-page-data";
import { buildPageMetadata } from "@/core/seo/page-metadata";
import { getStaticPageSeo } from "@/features/public-content/services/page-seo";
import { routing } from "@/i18n/routing";

type ServicesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const seo = await getStaticPageSeo(locale, "services");
  return buildPageMetadata({ locale, path: "/services", ...seo });
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const view = await getServicesPageData(locale);

  return <ServicesPageContent view={view} />;
}
