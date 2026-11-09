"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Icon } from "@/core/ui/icon";
import { labelRole } from "@/features/dashboard/labels";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { ActionMenu } from "@/features/dashboard/ui/action-menu";
import { Avatar } from "@/features/dashboard/ui/avatar";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardSwitch, DashboardTextField, DashboardSelect } from "@/features/dashboard/ui/dashboard-field";
import { DataTable } from "@/features/dashboard/ui/data-table";
import { Drawer } from "@/features/dashboard/ui/drawer";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { RelativeTime } from "@/features/dashboard/ui/relative-time";
import { RoleBadge } from "@/features/dashboard/ui/role-badge";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";
import { useDashboardToast } from "@/features/dashboard/ui/toast";
import type { AppLocale } from "@/i18n/routing";
import {
  adminInviteUser,
  adminPatchUser,
  adminResendInvite,
  adminResetUserMfa,
  adminRevokeInvite,
  adminRevokeUserSessions,
  adminUsers,
} from "@/lib/api/admin-browser";
import type { AdminUser } from "@/lib/api/types";

const ROLE_META = {
  super_admin: { color: "#1B5FA8", descriptionKey: "roleDescSuper" as const },
  editor: { color: "#0e8442", descriptionKey: "roleDescEditor" as const },
};

export default function UsersPage() {
  const t = useTranslations("Dashboard.users");
  const locale: AppLocale = readDashboardLocaleFromDocument();
  const pushToast = useDashboardToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invitations, setInvitations] = useState<{ id: number; name: string; email: string; role: string; status: string }[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const payload = await adminUsers();
    setUsers(payload.data);
    setInvitations(payload.invitations);
    setCounts(payload.role_counts);
    setLoaded(true);
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  async function invite(event: React.FormEvent) {
    event.preventDefault();
    await adminInviteUser({ name, email, role });
    setName("");
    setEmail("");
    setDrawerOpen(false);
    pushToast(t("invited"));
    await load();
  }

  const lastSuperAdmin = (counts.super_admin ?? 0) <= 1;
  const rows = [
    ...users.map((user) => ({ kind: "user" as const, id: `u-${user.id}`, user })),
    ...invitations.map((inviteRow) => ({ kind: "invite" as const, id: `i-${inviteRow.id}`, invite: inviteRow })),
  ];

  return (
    <div className="space-y-6" data-dashboard-toolbar data-ready="true">
      <PageHeader
        actions={
          <DashboardButton icon={<Icon name="plus" />} onClick={() => setDrawerOpen(true)} type="button">
            {t("inviteUser")}
          </DashboardButton>
        }
        subtitle={t("subtitle")}
        title={t("title")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {(["super_admin", "editor"] as const).map((roleKey) => (
          <article className="rounded-2xl border border-line bg-elevated p-5" key={roleKey}>
            <span className="mb-2 inline-block size-2 rounded-full" style={{ background: ROLE_META[roleKey].color }} />
            <h2 className="text-h5">{labelRole(roleKey, locale)}</h2>
            <p className="mt-1 text-body-s text-muted">{t(ROLE_META[roleKey].descriptionKey)}</p>
            <p className="mt-3 font-display text-h3 tabular-nums">{counts[roleKey] ?? 0}</p>
          </article>
        ))}
      </div>
      <DataTable
        loading={!loaded}
        columns={[
          {
            id: "person",
            header: t("name"),
            cell: (row) =>
              row.kind === "user" ? (
                <div className="flex items-center gap-3">
                  <Avatar name={row.user.name} />
                  <span>
                    <span className="block font-medium">{row.user.name}</span>
                    <span className="text-caption text-muted">{row.user.email}</span>
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Avatar name={row.invite.name} />
                  <span>
                    <span className="block font-medium">{row.invite.name}</span>
                    <span className="text-caption text-muted">{row.invite.email}</span>
                  </span>
                </div>
              ),
          },
          {
            id: "role",
            header: t("role"),
            width: "140px",
            cell: (row) => (
              <RoleBadge locale={locale} role={row.kind === "user" ? row.user.roles[0] ?? "editor" : row.invite.role} />
            ),
          },
          {
            id: "department",
            header: t("department"),
            width: "140px",
            cell: (row) => (row.kind === "user" ? row.user.department ?? "—" : "—"),
          },
          {
            id: "lastLogin",
            header: t("lastLogin"),
            width: "140px",
            cell: (row) =>
              row.kind === "user" ? <RelativeTime locale={locale} value={row.user.last_login_at} /> : "—",
          },
          {
            id: "status",
            header: t("status"),
            width: "140px",
            cell: (row) =>
              row.kind === "user" ? (
                <DashboardSwitch
                  checked={row.user.is_active}
                  compact
                  disabled={lastSuperAdmin && row.user.roles.includes("super_admin") && row.user.is_active}
                  disabledReason={t("lastSuperAdmin")}
                  id={`user-active-${row.user.id}`}
                  label={row.user.is_active ? t("active") : t("inactive")}
                  onChange={(next) => void adminPatchUser(row.user.id, { is_active: next }).then(load)}
                />
              ) : (
                <span className="text-muted">{t("pending")}</span>
              ),
          },
        ]}
        emptyTitle={t("empty")}
        mobileCard={(row) => (
          <article className="rounded-2xl border border-line p-4" key={row.id}>
            {row.kind === "user" ? row.user.name : row.invite.name}
          </article>
        )}
        rowActions={(row) =>
          row.kind === "user" ? (
            <ActionMenu
              items={[
                {
                  id: "mfa",
                  label: t("resetMfa"),
                  icon: <Icon name="fingerprint" />,
                  onClick: () => void adminResetUserMfa(row.user.id).then(load),
                },
                {
                  id: "sessions",
                  label: t("revokeSessions"),
                  icon: <Icon name="logout" />,
                  onClick: () => void adminRevokeUserSessions(row.user.id),
                },
              ]}
              label={t("more")}
            />
          ) : (
            <>
              <RowActionButton label={t("resend")} onClick={() => void adminResendInvite(row.invite.id).then(load)}>
                <Icon name="send" />
              </RowActionButton>
              <RowActionButton label={t("cancel")} onClick={() => void adminRevokeInvite(row.invite.id).then(load)}>
                <Icon name="trash" />
              </RowActionButton>
            </>
          )
        }
        rows={rows}
      />
      <Drawer onClose={() => setDrawerOpen(false)} open={drawerOpen} title={t("inviteUser")}>
        <form className="space-y-4" onSubmit={(event) => void invite(event)}>
          <DashboardTextField id="invite-name" label={t("name")} onChange={(event) => setName(event.target.value)} required value={name} />
          <DashboardTextField
            id="invite-email"
            label={t("email")}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
          <DashboardSelect id="invite-role" label={t("role")} onChange={(event) => setRole(event.target.value)} value={role}>
            <option value="editor">{labelRole("editor", locale)}</option>
            <option value="super_admin">{labelRole("super_admin", locale)}</option>
          </DashboardSelect>
          <DashboardButton type="submit">{t("invite")}</DashboardButton>
        </form>
      </Drawer>
    </div>
  );
}
