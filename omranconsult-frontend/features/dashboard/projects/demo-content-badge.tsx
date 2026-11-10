import { useTranslations } from "next-intl";

export function DemoContentBadge() {
  const t = useTranslations("Dashboard.projects");

  return (
    <span
      className="inline-flex h-[1.625rem] max-w-full items-center rounded-full bg-highlight px-2.5 text-caption font-medium whitespace-nowrap text-secondary"
      data-demo-badge="true"
    >
      {t("demoContent")}
    </span>
  );
}
