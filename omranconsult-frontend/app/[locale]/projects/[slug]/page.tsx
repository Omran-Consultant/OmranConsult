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
  const path = `/projects/${encodeURIComponent(slug)}`;
  const metadata = routeAlternatesMetadata(locale, path);
  if (locale !== "en" && locale !== "ar") {
    return metadata;
  }
  const project = await getProjectDetailData(locale, slug);
  if (!project) {
    return metadata;
  }
  return {
    ...metadata,
    ...(project.seoTitle ? { title: project.seoTitle } : {}),
    ...(project.seoDescription ? { description: project.seoDescription } : {}),
    ...(project.seoTitle || project.seoDescription || project.ogImage
      ? {
          openGraph: {
            ...(project.seoTitle ? { title: project.seoTitle } : {}),
            ...(project.seoDescription ? { description: project.seoDescription } : {}),
            ...(project.ogImage ? { images: [{ url: project.ogImage.src, alt: project.ogImage.alt }] } : {}),
          },
        }
      : {}),
  };
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
