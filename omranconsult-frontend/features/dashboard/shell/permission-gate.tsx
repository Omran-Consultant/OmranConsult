"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { ForbiddenScreen } from "@/features/dashboard/shell/forbidden-screen";
import { requiredDashboardPermission } from "@/features/dashboard/shell/required-permission";
import { useDashboardSession } from "@/features/dashboard/shell/session-context";

export function DashboardPermissionGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { can } = useDashboardSession();
  const required = requiredDashboardPermission(pathname);

  if (required && !can(required)) {
    return <ForbiddenScreen />;
  }

  return children;
}
