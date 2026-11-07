import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ProjectDetailPageContent } from "@/features/projects/components/project-detail-page-content";
import { getProjectDetailData } from "@/features/projects/services/get-project-detail-data";
import { routing } from "@/i18n/routing";

type ProjectDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const instant = false;

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const project = await getProjectDetailData(locale, slug);

  if (!project) {
    notFound();
  }

  return <ProjectDetailPageContent locale={locale} project={project} />;
}
