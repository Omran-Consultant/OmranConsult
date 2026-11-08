import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ProjectsPageContent } from "@/features/projects/components/projects-page-content";
import { getProjectsPageData } from "@/features/projects/services/get-projects-page-data";
import { parseProjectsFilters } from "@/features/projects/services/projects-filters";
import { routing } from "@/i18n/routing";

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const instant = false;

export default async function ProjectsPage({ params, searchParams }: ProjectsPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const view = await getProjectsPageData(locale, parseProjectsFilters(await searchParams));
  return <ProjectsPageContent view={view} />;
}
