import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ProjectsPageContent } from "@/features/projects/components/projects-page-content";
import { getProjectsPageData } from "@/features/projects/services/get-projects-page-data";
import { routing } from "@/i18n/routing";

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    client?: string;
    region?: string;
    page?: string;
  }>;
};

export const instant = false;

export default async function ProjectsPage({ params, searchParams }: ProjectsPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const filters = {
    client: resolvedSearchParams.client,
    region: resolvedSearchParams.region,
    page: resolvedSearchParams.page ? Number(resolvedSearchParams.page) : undefined,
  };

  const data = await getProjectsPageData(locale, filters);
  return <ProjectsPageContent data={data} filters={filters} locale={locale} />;
}
