"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState, type FormEvent } from "react";

import { Button } from "@/core/ui/button";
import { Icon } from "@/core/ui/icon";
import { InputField } from "@/core/ui/input-field";
import { INQUIRY_LIMITS, isValidEmail } from "@/core/validation/inquiry";
import type { AppLocale } from "@/i18n/routing";
import { ApiError } from "@/lib/api/errors";
import { postInquiry } from "@/lib/api/public-writes";

type Field = "name" | "organisation" | "email";

type Status =
  | { readonly kind: "idle" }
  | { readonly kind: "submitting" }
  | { readonly kind: "success"; readonly message: string }
  | { readonly kind: "error"; readonly message: string };

type ProjectInquiryCardProps = {
  readonly projectSlug: string;
  readonly title?: string;
  readonly text?: string;
};

/**
 * Figma "Inquiry Card" «مشروع مشابه؟» (B7, `source=project`). Errors show after blur or submit;
 * the result is announced through aria-live and success replaces the form. The 390 frame has no
 * organisation field, so it is hidden below 768 px (it is optional).
 */
export function ProjectInquiryCard({ projectSlug, title, text }: ProjectInquiryCardProps) {
  const t = useTranslations("Inquiry");
  const locale = useLocale() as AppLocale;
  const id = useId();
  const [values, setValues] = useState<Record<Field, string>>({ name: "", organisation: "", email: "" });
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Partial<Record<Field, string>>>({});
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const clientErrors: Partial<Record<Field, string>> = {
    name: values.name.trim() ? undefined : t("nameRequired"),
    email: isValidEmail(values.email) ? undefined : t("emailInvalid"),
  };
  const errorFor = (field: Field) => (touched[field] ? clientErrors[field] : undefined) ?? serverErrors[field];

  const bind = (field: Field) => ({
    name: field,
    value: values[field],
    onChange: (event: { target: { value: string } }) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setServerErrors((current) => ({ ...current, [field]: undefined }));
    },
    onBlur: () => setTouched((current) => ({ ...current, [field]: values[field].length > 0 || current[field] })),
    error: errorFor(field),
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ name: true, organisation: true, email: true });
    if (clientErrors.name || clientErrors.email || status.kind === "submitting") {
      return;
    }
    setStatus({ kind: "submitting" });
    try {
      const response = await postInquiry(locale, {
        name: values.name.trim(),
        email: values.email.trim(),
        organisation: values.organisation.trim() || undefined,
        source: "project",
        project_slug: projectSlug,
        website,
      });
      setStatus({ kind: "success", message: response.message });
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.errors) {
        setServerErrors({
          name: error.errors.name ? t("nameRequired") : undefined,
          email: error.errors.email ? t("emailInvalid") : undefined,
        });
      }
      const tooMany = error instanceof ApiError && error.status === 429;
      setStatus({ kind: "error", message: tooMany ? t("tooMany") : t("error") });
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-line bg-elevated px-5 py-6 md:gap-6 md:p-8">
      {title ? <h2 className="font-display text-h3 text-primary">{title}</h2> : null}
      {status.kind === "success" ? (
        <p aria-live="polite" className="flex items-start gap-3 text-body-m text-primary" role="status">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-strong/16 text-accent">
            <Icon name="check" />
          </span>
          {status.message}
        </p>
      ) : (
        <>
          {text ? <p className="text-body-s text-secondary max-md:hidden">{text}</p> : null}
          <form className="flex flex-col gap-4 md:gap-5" noValidate onSubmit={onSubmit}>
            <InputField autoComplete="name" id={`${id}-name`} label={t("nameLabel")} maxLength={INQUIRY_LIMITS.name} placeholder={t("namePlaceholder")} required {...bind("name")} />
            <InputField
              autoComplete="organization"
              className="max-md:hidden"
              id={`${id}-organisation`}
              label={t("organisationLabel")}
              maxLength={INQUIRY_LIMITS.organisation}
              placeholder={t("organisationPlaceholder")}
              {...bind("organisation")}
            />
            <InputField
              autoComplete="email"
              id={`${id}-email`}
              inputMode="email"
              label={t("emailLabel")}
              maxLength={INQUIRY_LIMITS.email}
              placeholder={t("emailPlaceholder")}
              required
              type="email"
              {...bind("email")}
            />
            <div aria-hidden="true" className="sr-only">
              <label htmlFor={`${id}-website`}>Website</label>
              <input autoComplete="off" id={`${id}-website`} name="website" onChange={(event) => setWebsite(event.target.value)} tabIndex={-1} type="text" value={website} />
            </div>
            <p aria-live="polite" className="text-caption text-danger empty:hidden">
              {status.kind === "error" ? status.message : null}
            </p>
            <Button arrow className="w-full" loading={status.kind === "submitting"} type="submit">
              {t("submit")}
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
