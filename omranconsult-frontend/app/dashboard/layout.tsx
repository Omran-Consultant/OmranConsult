import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

import { publicFontVariables } from "@/core/fonts/public";
import { themeInitScript } from "@/core/theme/theme-init-script";
import { ThemeProvider } from "@/core/theme/theme-provider";
import { parseDashboardLocale, DASHBOARD_LOCALE_COOKIE } from "@/features/dashboard/i18n/locale";
import { getLocaleDirection } from "@/i18n/routing";

export const instant = false;

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "omranconsult dashboard",
};

export default async function DashboardRootLayout({ children }: { children: ReactNode }) {
  const jar = await cookies();
  const locale = parseDashboardLocale(jar.get(DASHBOARD_LOCALE_COOKIE)?.value);
  const messages = (await import(`../../messages/${locale}.json`)).default;
  const dir = getLocaleDirection(locale);

  return (
    <html className={publicFontVariables} dir={dir} lang={locale}>
      <body>
        <Script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          id="theme-init"
          strategy="beforeInteractive"
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
