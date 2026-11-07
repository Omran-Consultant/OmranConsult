import { fetchApiHealth } from "@/lib/api/server-client";
import { getTranslations } from "next-intl/server";

export async function ApiConnectivity() {
  const t = await getTranslations("ApiConnectivity");
  let apiReachable = false;

  try {
    const health = await fetchApiHealth();
    apiReachable = health.status === "ok";
  } catch {
    apiReachable = false;
  }

  return (
    <section
      aria-label={t("sectionLabel")}
      className="rounded-lg border border-border bg-surface p-4 shadow-card"
    >
      <h2 className="text-base font-medium text-heading">
        {t("heading")}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {apiReachable ? t("ok") : t("unavailable")}
      </p>
    </section>
  );
}
