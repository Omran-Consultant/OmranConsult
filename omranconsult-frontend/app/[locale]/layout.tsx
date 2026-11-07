import type { Metadata } from "next";
import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { publicFontVariables } from "@/core/fonts/public";
import {
  buildPublicLocaleAlternates,
  getPublicMetadataBase,
} from "@/core/seo/locale-metadata";
import { themeInitScript } from "@/core/theme/theme-init-script";
import { ThemeProvider } from "@/core/theme/theme-provider";
import { PublicLayoutShell } from "@/features/layout/components/public-layout-shell";
import type { AppLocale } from "@/i18n/routing";
import { getLocaleDirection, routing } from "@/i18n/routing";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

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
  const alternates = buildPublicLocaleAlternates(locale as AppLocale);

  return {
    ...(metadataBase ? { metadataBase } : {}),
    title: t("title"),
    description: t("description"),
    alternates,
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

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${publicFontVariables} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          id="theme-init"
          strategy="beforeInteractive"
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <PublicLayoutShell>{children}</PublicLayoutShell>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
