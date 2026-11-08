import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ServicesPageContent } from "@/features/services/components/services-page-content";
import { getServicesPageData } from "@/features/services/services/get-services-page-data";
import { routeAlternatesMetadata } from "@/core/seo/locale-metadata";
import { routing } from "@/i18n/routing";

type ServicesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return routeAlternatesMetadata(locale, "/services");
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
