"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/core/ui/button";
import { Icon } from "@/core/ui/icon";
import { labelRole } from "@/features/dashboard/labels";
import { readDashboardLocaleFromDocument } from "@/features/dashboard/i18n/locale";
import { Avatar } from "@/features/dashboard/ui/avatar";
import { controlMdClass } from "@/features/dashboard/ui/control-styles";
import { DashboardTextField, DashboardSelect } from "@/features/dashboard/ui/dashboard-field";
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
    void load();
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

  const rows = [
    ...users.map((user) => ({ kind: "user" as const, id: `u-${user.id}`, user })),
    ...invitations.map((invite) => ({ kind: "invite" as const, id: `i-${invite.id}`, invite })),
  ];

  return (
    <div className="space-y-6" data-dashboard-toolbar data-ready="true">
      <PageHeader
        actions={
          <Button onClick={() => setDrawerOpen(true)} type="button">
            <Icon name="plus" />
            {t("inviteUser")}
          </Button>
        }
        title={t("title")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {(["super_admin", "editor"] as const).map((roleKey) => (
          <article className="rounded-2xl border border-line bg-elevated p-5" key={roleKey}>
            <span className="mb-2 inline-block size-2 rounded-full" style={{ background: ROLE_META[roleKey].color }} />
            <h2 className="text-h5">{labelRole(roleKey, locale)}</h2>
            <p className="mt-1 text-body-s text-muted">{t(ROLE_META[roleKey].descriptionKey)}</p>
            <p className="mt-3 font-display text-h3">{counts[roleKey] ?? 0}</p>
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
            cell: (row) => (
              <RoleBadge locale={locale} role={row.kind === "user" ? row.user.roles[0] ?? "editor" : row.invite.role} />
            ),
          },
          {
            id: "department",
            header: t("department"),
            cell: (row) => (row.kind === "user" ? row.user.department ?? "—" : "—"),
          },
          {
            id: "lastLogin",
            header: t("lastLogin"),
            cell: (row) =>
              row.kind === "user" ? <RelativeTime locale={locale} value={row.user.last_login_at} /> : "—",
          },
          {
            id: "status",
            header: t("status"),
            cell: (row) =>
              row.kind === "user" ? (
                <label className="flex items-center gap-2 text-body-s">
                  <input
                    checked={row.user.is_active}
                    className="size-5 accent-accent"
                    onChange={() => void adminPatchUser(row.user.id, { is_active: !row.user.is_active }).then(load)}
                    type="checkbox"
                  />
                  {row.user.is_active ? t("active") : t("inactive")}
                </label>
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
            <>
              <RowActionButton label={t("resetMfa")} onClick={() => void adminResetUserMfa(row.user.id).then(load)}>
                <Icon name="fingerprint" />
              </RowActionButton>
              <RowActionButton label={t("revokeSessions")} onClick={() => void adminRevokeUserSessions(row.user.id)}>
                <Icon name="logout" />
              </RowActionButton>
            </>
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
          <Button className={controlMdClass} type="submit">
            {t("invite")}
          </Button>
        </form>
      </Drawer>
    </div>
  );
}
