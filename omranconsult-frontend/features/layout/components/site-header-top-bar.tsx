import { getTranslations } from "next-intl/server";

import { Icon } from "@/core/ui/icon";

export async function SiteHeaderTopBar() {
  const t = await getTranslations("Layout.topBar");

  const phones = [
    { tel: t("phoneTel"), display: t("phoneDisplay") },
    { tel: t("phoneSecondaryTel"), display: t("phoneSecondaryDisplay") },
  ] as const;

  return (
    <div className="relative z-50 hidden bg-elevated py-2 text-white shadow-md md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <a
            className="flex items-center gap-2 rounded-full px-3 py-1 transition-all hover:bg-elevated/90"
            href={`mailto:${t("email")}`}
          >
            <Icon className="size-3 sm:size-4" name="mail" />
            <span>{t("email")}</span>
          </a>
          {phones.map((phone) => (
            <a
              className="flex items-center gap-2 rounded-full px-3 py-1 transition-all hover:bg-elevated/90"
              href={`tel:${phone.tel}`}
              key={phone.tel}
            >
              <Icon className="size-3 sm:size-4" name="phone" />
              <span dir="ltr">{phone.display}</span>
            </a>
          ))}
        </div>
        {/* U26: social profile URLs are not approved yet; keep icons out of the top bar. */}
      </div>
    </div>
  );
}
