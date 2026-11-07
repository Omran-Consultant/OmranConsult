import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ApiConnectivity } from "@/app/[locale]/api-connectivity";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PublicHomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const apiT = await getTranslations("ApiConnectivity");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">
          {t("phaseLabel")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="text-lg leading-8 text-muted">{t("description")}</p>
      </div>

      <Suspense
        fallback={
          <section
            aria-label={apiT("sectionLabel")}
            className="rounded-lg border border-border bg-surface p-4 shadow-card"
          >
            <p className="text-sm text-muted">{apiT("checking")}</p>
          </section>
        }
      >
        <ApiConnectivity />
      </Suspense>
    </main>
  );
}
