import { Suspense } from "react";
import { cookies } from "next/headers";

import { LoginScreen } from "@/features/dashboard/auth/login-screen";
import { DASHBOARD_LOCALE_COOKIE, parseDashboardLocale } from "@/features/dashboard/i18n/locale";

export default async function DashboardLoginPage() {
  const locale = parseDashboardLocale((await cookies()).get(DASHBOARD_LOCALE_COOKIE)?.value);

  return (
    <Suspense>
      <LoginScreen locale={locale} />
    </Suspense>
  );
}
