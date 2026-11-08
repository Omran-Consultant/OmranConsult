import type { Metadata } from "next";
import { cookies, draftMode } from "next/headers";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ProjectDetailPageContent } from "@/features/projects/components/project-detail-page-content";
import { getProjectDetailData } from "@/features/projects/services/get-project-detail-data";
import { routeAlternatesMetadata } from "@/core/seo/locale-metadata";
import { routing } from "@/i18n/routing";

type ProjectDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  return routeAlternatesMetadata(locale, `/projects/${encodeURIComponent(slug)}`);
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const preview = (await draftMode()).isEnabled;
  const token = preview ? (await cookies()).get("PREVIEW_TOKEN")?.value : undefined;
  const project = await getProjectDetailData(locale, slug, token);

  if (!project) {
    notFound();
  }

  return <ProjectDetailPageContent project={project} />;
}
