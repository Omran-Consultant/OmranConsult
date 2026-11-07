import { getTranslations, setRequestLocale } from "next-intl/server";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PublicHomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HomePlaceholder");

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-24">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">
          {t("eyebrow")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="text-lg text-muted ltr:leading-8">{t("description")}</p>
      </div>
    </main>
  );
}
