import type { IconName } from "@/core/ui/icon";

export type DashboardNavItem = {
  href: string;
  labelKey: string;
  icon: IconName;
  permission?: string;
  badge?: "inquiries";
};

export type DashboardNavGroup = {
  labelKey: string;
  items: DashboardNavItem[];
};

export const DASHBOARD_NAV: DashboardNavGroup[] = [
  {
    labelKey: "nav.overview",
    items: [{ href: "/dashboard", labelKey: "nav.home", icon: "chart" }],
  },
  {
    labelKey: "nav.content",
    items: [
      { href: "/dashboard/projects", labelKey: "nav.projects", icon: "buildings", permission: "content.projects.view" },
      { href: "/dashboard/services", labelKey: "nav.services", icon: "layers", permission: "content.services.view" },
      { href: "/dashboard/news", labelKey: "nav.news", icon: "clipboard", permission: "content.news.view" },
      { href: "/dashboard/pages", labelKey: "nav.pages", icon: "file", permission: "content.pages.view" },
      { href: "/dashboard/partners", labelKey: "nav.partners", icon: "users", permission: "content.partners.view" },
      { href: "/dashboard/team", labelKey: "nav.team", icon: "users", permission: "content.team.view" },
      { href: "/dashboard/documents", labelKey: "nav.documents", icon: "file", permission: "content.documents.view" },
      { href: "/dashboard/media", labelKey: "nav.media", icon: "image", permission: "content.media.view" },
      { href: "/dashboard/disputes", labelKey: "nav.disputes", icon: "clipboard", permission: "content.disputes.view" },
    ],
  },
  {
    labelKey: "nav.inbox",
    items: [
      { href: "/dashboard/inquiries", labelKey: "nav.inquiries", icon: "inbox", permission: "inbox.inquiries.view", badge: "inquiries" },
      { href: "/dashboard/newsletter", labelKey: "nav.newsletter", icon: "mail", permission: "inbox.newsletter.view" },
    ],
  },
  {
    labelKey: "nav.admin",
    items: [
      { href: "/dashboard/activity", labelKey: "nav.activity", icon: "clock", permission: "admin.audit.view" },
      { href: "/dashboard/users", labelKey: "nav.users", icon: "users", permission: "admin.users.view" },
      { href: "/dashboard/settings", labelKey: "nav.settings", icon: "cog", permission: "admin.settings.view" },
      { href: "/dashboard/trash", labelKey: "nav.trash", icon: "trash", permission: "content.trash.view" },
    ],
  },
];
