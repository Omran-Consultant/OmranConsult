"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { Button } from "@/core/ui/button";
import { InputField } from "@/core/ui/input-field";
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

export default function UsersPage() {
  const t = useTranslations("Dashboard.users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [invitations, setInvitations] = useState<{ id: number; name: string; email: string; role: string; status: string }[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");
  const [message, setMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function load() {
    const payload = await adminUsers();
    setUsers(payload.data);
    setInvitations(payload.invitations);
    setCounts(payload.role_counts);
    setLoaded(true);
  }

  useEffect(() => {
    void adminUsers().then((payload) => {
      setUsers(payload.data);
      setInvitations(payload.invitations);
      setCounts(payload.role_counts);
      setLoaded(true);
    });
  }, []);

  async function invite(event: React.FormEvent) {
    event.preventDefault();
    await adminInviteUser({ name, email, role });
    setName("");
    setEmail("");
    setMessage(t("invited"));
    await load();
  }

  return (
    <div className="space-y-6" data-ready={loaded ? "true" : "false"}>
      <h1 className="font-display text-h3">{t("title")}</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-line p-4">
          {t("roles.super_admin")}: {counts.super_admin ?? 0}
        </article>
        <article className="rounded-2xl border border-line p-4">
          {t("roles.editor")}: {counts.editor ?? 0}
        </article>
      </div>
      <form className="grid gap-3 rounded-2xl border border-line p-4 md:grid-cols-4" onSubmit={(event) => void invite(event)}>
        <InputField id="invite-name" label={t("name")} onChange={(event) => setName(event.target.value)} required value={name} />
        <InputField id="invite-email" label={t("email")} onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
        <label className="flex flex-col gap-2.5 text-label-s">
          {t("role")}
          <select className="rounded-md border border-line px-3 py-4" onChange={(event) => setRole(event.target.value)} value={role}>
            <option value="editor">{t("roles.editor")}</option>
            <option value="super_admin">{t("roles.super_admin")}</option>
          </select>
        </label>
        <Button type="submit">{t("invite")}</Button>
      </form>
      {message ? <p className="text-accent">{message}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-start text-body-s">
          <thead>
            <tr className="border-b border-line text-muted">
              <th className="py-2">{t("name")}</th>
              <th>{t("email")}</th>
              <th>{t("role")}</th>
              <th>{t("department")}</th>
              <th>{t("lastLogin")}</th>
              <th>{t("status")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr className="border-b border-line" key={user.id}>
                <td className="py-3">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.roles.join(", ")}</td>
                <td>{user.department ?? "—"}</td>
                <td>{user.last_login_at ?? "—"}</td>
                <td>{user.is_active ? t("active") : t("inactive")}</td>
                <td className="flex flex-wrap gap-1">
                  <Button
                    onClick={() => void adminPatchUser(user.id, { is_active: !user.is_active }).then(load)}
                    type="button"
                    variant="ghost"
                  >
                    {user.is_active ? t("deactivate") : t("activate")}
                  </Button>
                  <Button onClick={() => void adminResetUserMfa(user.id).then(load)} type="button" variant="ghost">
                    {t("resetMfa")}
                  </Button>
                  <Button onClick={() => void adminRevokeUserSessions(user.id)} type="button" variant="ghost">
                    {t("revokeSessions")}
                  </Button>
                </td>
              </tr>
            ))}
            {invitations.map((invite) => (
              <tr className="border-b border-line" key={`i-${invite.id}`}>
                <td className="py-3">{invite.name}</td>
                <td>{invite.email}</td>
                <td>{invite.role}</td>
                <td>—</td>
                <td>—</td>
                <td>{t("pending")}</td>
                <td>
                  <Button onClick={() => void adminResendInvite(invite.id).then(load)} type="button" variant="ghost">
                    {t("resend")}
                  </Button>
                  <Button onClick={() => void adminRevokeInvite(invite.id).then(load)} type="button" variant="ghost">
                    {t("cancel")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
