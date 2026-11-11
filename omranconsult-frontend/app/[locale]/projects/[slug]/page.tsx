import type { Metadata } from "next";
import { cookies, draftMode } from "next/headers";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ProjectDetailPageContent } from "@/features/projects/components/project-detail-page-content";
import { getProjectDetailData } from "@/features/projects/services/get-project-detail-data";
import { firstParagraphText } from "@/core/content/blocks";
import { buildPageMetadata } from "@/core/seo/page-metadata";
import { getSiteSeo } from "@/features/public-content/services/page-seo";
import { routing } from "@/i18n/routing";

type ProjectDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }
  const [site, project] = await Promise.all([getSiteSeo(locale), getProjectDetailData(locale, slug)]);
  if (!project) {
    return {};
  }
  const image = project.ogImage ?? project.heroImage;
  return buildPageMetadata({
    locale,
    path: `/projects/${encodeURIComponent(slug)}`,
    siteName: site.siteName,
    title: project.seoTitle ?? project.title ?? site.siteName,
    description: project.seoDescription ?? firstParagraphText(project.overviewBlocks) ?? project.title ?? site.description,
    image: { url: image.src, alt: image.alt, width: image.width, height: image.height },
  });
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
