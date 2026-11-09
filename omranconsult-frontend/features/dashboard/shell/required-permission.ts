import { DASHBOARD_NAV } from "@/features/dashboard/shell/nav";

export function requiredDashboardPermission(pathname: string): string | undefined {
  const matches: { href: string; permission?: string }[] = [];

  for (const group of DASHBOARD_NAV) {
    for (const item of group.items) {
      if (item.href === "/dashboard") {
        if (pathname === "/dashboard") {
          return item.permission;
        }
        continue;
      }
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        matches.push(item);
      }
    }
  }

  matches.sort((a, b) => b.href.length - a.href.length);

  return matches[0]?.permission;
}
