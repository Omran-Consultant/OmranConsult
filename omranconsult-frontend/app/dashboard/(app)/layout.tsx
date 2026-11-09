import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { DASHBOARD_LOCALE_COOKIE, parseDashboardLocale } from "@/features/dashboard/i18n/locale";
import { DashboardShell } from "@/features/dashboard/shell/dashboard-shell";
import { DashboardSessionProvider } from "@/features/dashboard/shell/session-context";
import { DashboardToastProvider } from "@/features/dashboard/ui/toast";

export default async function DashboardAppLayout({ children }: { children: ReactNode }) {
  const locale = parseDashboardLocale((await cookies()).get(DASHBOARD_LOCALE_COOKIE)?.value);

  return (
    <DashboardSessionProvider locale={locale}>
      <DashboardToastProvider>
        <DashboardShell locale={locale}>{children}</DashboardShell>
      </DashboardToastProvider>
    </DashboardSessionProvider>
  );
}
