import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

export async function PreviewBanner() {
  const t = await getTranslations("PreviewBanner");
  const locale = await getLocale();

  return (
    <div className="flex items-center justify-between gap-3 bg-accent-strong px-4 py-2 text-white" data-preview-banner="true" data-ready="true">
      <p className="text-label-s">{t("label")}</p>
      <Link className="text-label-s underline" href="/cms/preview/exit">
        {t("exit")}
      </Link>
      <span className="sr-only">{locale}</span>
    </div>
  );
}
