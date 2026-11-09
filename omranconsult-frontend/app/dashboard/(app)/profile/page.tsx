"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { persistDashboardLocale } from "@/features/dashboard/i18n/locale";
import { useDashboardSession } from "@/features/dashboard/shell/session-context";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardSwitch, DashboardTextField } from "@/features/dashboard/ui/dashboard-field";
import { PageHeader } from "@/features/dashboard/ui/page-header";
import { adminMfaConfirm, adminMfaDisable, adminMfaStart, adminPatchMe } from "@/lib/api/admin-browser";

export default function ProfilePage() {
  const t = useTranslations("Dashboard.profile");
  const { user, refresh } = useDashboardSession();
  const [name, setName] = useState(user?.name ?? "");
  const [department, setDepartment] = useState(user?.department ?? "");
  const [secret, setSecret] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notify, setNotify] = useState(user?.notify_inquiries ?? false);
  const [message, setMessage] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8" data-ready="true">
      <PageHeader subtitle={t("subtitle")} title={t("title")} />
      {message ? <p className="text-accent">{message}</p> : null}
      <form
        className="space-y-3 rounded-2xl border border-line bg-elevated p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void adminPatchMe({ name, department: department || null }).then(() => {
            setMessage(t("saved"));
            void refresh();
          });
        }}
      >
        <DashboardTextField id="profile-name" label={t("name")} onChange={(event) => setName(event.target.value)} value={name} />
        <DashboardTextField id="profile-dept" label={t("department")} onChange={(event) => setDepartment(event.target.value)} value={department} />
        <DashboardButton type="submit">{t("save")}</DashboardButton>
      </form>
      <form
        className="space-y-3 rounded-2xl border border-line bg-elevated p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void adminPatchMe({
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword,
          }).then(() => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setMessage(t("passwordSaved"));
          });
        }}
      >
        <h2 className="text-h5">{t("passwordTitle")}</h2>
        <DashboardTextField id="current-pass" label={t("currentPassword")} onChange={(event) => setCurrentPassword(event.target.value)} type="password" value={currentPassword} />
        <DashboardTextField id="new-pass" label={t("newPassword")} onChange={(event) => setNewPassword(event.target.value)} type="password" value={newPassword} />
        <DashboardTextField id="confirm-pass" label={t("confirmPassword")} onChange={(event) => setConfirmPassword(event.target.value)} type="password" value={confirmPassword} />
        <DashboardButton type="submit">{t("savePassword")}</DashboardButton>
      </form>
      <div className="flex gap-2">
        <DashboardButton
          onClick={() => {
            persistDashboardLocale("ar");
            void adminPatchMe({ dashboard_locale: "ar" }).then(() => refresh());
          }}
          type="button"
          variant="secondary"
        >
          العربية
        </DashboardButton>
        <DashboardButton
          onClick={() => {
            persistDashboardLocale("en");
            void adminPatchMe({ dashboard_locale: "en" }).then(() => refresh());
          }}
          type="button"
          variant="secondary"
        >
          English
        </DashboardButton>
      </div>
      <DashboardSwitch
        checked={notify}
        id="notify"
        label={t("notify")}
        onChange={(next) => {
          setNotify(next);
          void adminPatchMe({ notify_inquiries: next }).then(() => refresh());
        }}
      />
      <section className="space-y-3 rounded-2xl border border-line bg-elevated p-5">
        <h2 className="text-h5">{t("mfa")}</h2>
        {user.mfa_enabled ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void adminMfaDisable({ password, code }).then(() => refresh());
            }}
          >
            <DashboardTextField id="mfa-pass" label={t("password")} onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
            <DashboardTextField id="mfa-off" label={t("code")} onChange={(event) => setCode(event.target.value)} value={code} />
            <DashboardButton type="submit">{t("disableMfa")}</DashboardButton>
          </form>
        ) : (
          <div className="space-y-3">
            <DashboardButton
              onClick={() =>
                void adminMfaStart().then((payload) => {
                  setSecret(payload.secret);
                  setQr(payload.qr_svg);
                })
              }
              type="button"
            >
              {t("enableMfa")}
            </DashboardButton>
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element -- MFA QR is an API SVG data URL.
              <img
                alt=""
                className="size-48"
                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(qr)}`}
              />
            ) : null}
            {secret ? (
              <p className="text-caption" data-mfa-secret>
                {secret}
              </p>
            ) : null}
            {secret ? (
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void adminMfaConfirm(code)
                    .then((payload) => {
                      setCodes(payload.recovery_codes);
                      void refresh();
                    })
                    .catch(() => setMessage(t("mfaInvalid")));
                }}
              >
                <DashboardTextField id="mfa-on" label={t("code")} onChange={(event) => setCode(event.target.value)} value={code} />
                <DashboardButton type="submit">{t("confirmMfa")}</DashboardButton>
              </form>
            ) : null}
          </div>
        )}
        {codes ? (
          <div className="space-y-2 rounded-xl bg-highlight p-4">
            <h3 className="text-label-s">{t("recoveryTitle")}</h3>
            <p className="text-caption text-muted">{t("recoveryHint")}</p>
            <ul className="grid gap-1 font-mono text-body-s" data-recovery-codes>
              {codes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a className="text-accent underline" download="omranconsult-recovery-codes.txt" href={`data:text/plain,${encodeURIComponent(codes.join("\n"))}`}>
              {t("downloadCodes")}
            </a>
          </div>
        ) : null}
      </section>
    </div>
  );
}
