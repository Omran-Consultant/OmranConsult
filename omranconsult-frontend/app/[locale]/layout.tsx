import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { publicFontVariables } from "@/core/fonts/public";
import { getPublicMetadataBase } from "@/core/seo/locale-metadata";
import { ThemeInit } from "@/core/theme/theme-init";
import { ThemeProvider } from "@/core/theme/theme-provider";
import { PreviewBanner } from "@/features/layout/components/preview-banner";
import { PublicLayoutShell } from "@/features/layout/components/public-layout-shell";
import { getLocaleDirection, routing } from "@/i18n/routing";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * The locale layout reads the locale for `<html lang dir>`, so it cannot sit inside Suspense, and a
 * locale switch re-renders the whole document anyway. Navigations below it stay validated.
 */
export const instant = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const metadataBase = getPublicMetadataBase();

  return {
    ...(metadataBase ? { metadataBase } : {}),
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale,
      type: "website",
      images: [
        {
          url: "/images/og-default.jpg",
          width: 1200,
          height: 630,
          alt: t("title"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/images/og-default.jpg"],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const direction = getLocaleDirection(locale);
  const preview = (await draftMode()).isEnabled;

  return (
    <html
      lang={locale}
      dir={direction}
      // Light is the default theme (A35); the pre-paint script adds dark only for a
      // stored dark preference, before the page becomes visible.
      className={`${publicFontVariables} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeInit />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            {preview ? <PreviewBanner /> : null}
            <PublicLayoutShell>{children}</PublicLayoutShell>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
