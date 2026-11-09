"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/core/ui/button";
import { InputField } from "@/core/ui/input-field";
import { persistDashboardLocale } from "@/features/dashboard/i18n/locale";
import { useDashboardSession } from "@/features/dashboard/shell/session-context";
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
      <h1 className="font-display text-h3">{t("title")}</h1>
      {message ? <p className="text-accent">{message}</p> : null}
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void adminPatchMe({ name, department: department || null }).then(() => {
            setMessage(t("saved"));
            void refresh();
          });
        }}
      >
        <InputField id="profile-name" label={t("name")} onChange={(event) => setName(event.target.value)} value={name} />
        <InputField id="profile-dept" label={t("department")} onChange={(event) => setDepartment(event.target.value)} value={department} />
        <Button type="submit">{t("save")}</Button>
      </form>
      <form
        className="space-y-3 rounded-2xl border border-line p-4"
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
        <InputField id="current-pass" label={t("currentPassword")} onChange={(event) => setCurrentPassword(event.target.value)} type="password" value={currentPassword} />
        <InputField id="new-pass" label={t("newPassword")} onChange={(event) => setNewPassword(event.target.value)} type="password" value={newPassword} />
        <InputField id="confirm-pass" label={t("confirmPassword")} onChange={(event) => setConfirmPassword(event.target.value)} type="password" value={confirmPassword} />
        <Button type="submit">{t("savePassword")}</Button>
      </form>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            persistDashboardLocale("ar");
            void adminPatchMe({ dashboard_locale: "ar" }).then(() => refresh());
          }}
          type="button"
          variant="secondary"
        >
          العربية
        </Button>
        <Button
          onClick={() => {
            persistDashboardLocale("en");
            void adminPatchMe({ dashboard_locale: "en" }).then(() => refresh());
          }}
          type="button"
          variant="secondary"
        >
          English
        </Button>
      </div>
      <label className="flex items-center gap-2 text-body-s">
        <input
          checked={notify}
          onChange={(event) => {
            const next = event.target.checked;
            setNotify(next);
            void adminPatchMe({ notify_inquiries: next }).then(() => refresh());
          }}
          type="checkbox"
        />
        {t("notify")}
      </label>
      <section className="space-y-3 rounded-2xl border border-line p-4">
        <h2 className="text-h5">{t("mfa")}</h2>
        {user.mfa_enabled ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void adminMfaDisable({ password, code }).then(() => refresh());
            }}
          >
            <InputField id="mfa-pass" label={t("password")} onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
            <InputField id="mfa-off" label={t("code")} onChange={(event) => setCode(event.target.value)} value={code} />
            <Button type="submit">{t("disableMfa")}</Button>
          </form>
        ) : (
          <div className="space-y-3">
            <Button
              onClick={() =>
                void adminMfaStart().then((payload) => {
                  setSecret(payload.secret);
                  setQr(payload.qr_svg);
                })
              }
              type="button"
            >
              {t("enableMfa")}
            </Button>
            {qr ? (
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
                <InputField id="mfa-on" label={t("code")} onChange={(event) => setCode(event.target.value)} value={code} />
                <Button type="submit">{t("confirmMfa")}</Button>
              </form>
            ) : null}
          </div>
        )}
        {codes ? (
          <div className="space-y-2">
            <ul className="grid gap-1 font-mono text-body-s" data-recovery-codes>
              {codes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <a download="omranconsult-recovery-codes.txt" href={`data:text/plain,${encodeURIComponent(codes.join("\n"))}`}>
              {t("downloadCodes")}
            </a>
          </div>
        ) : null}
      </section>
    </div>
  );
}
