"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button } from "@/core/ui/button";
import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { InputField, SelectField, TextAreaField } from "@/core/ui/input-field";
import { INQUIRY_LIMITS, isValidEmail, isValidSaudiMobile, normalizePhone } from "@/core/validation/inquiry";
import type { AppLocale } from "@/i18n/routing";
import { ApiError } from "@/lib/api/errors";
import { postInquiry } from "@/lib/api/public-writes";

type TextField = "name" | "organisation" | "email" | "phone" | "service_type" | "message";
type Field = TextField | "consent";

type Status =
  | { readonly kind: "idle" }
  | { readonly kind: "submitting" }
  | { readonly kind: "success"; readonly message: string }
  | { readonly kind: "error"; readonly message: string };

type ContactFormProps = {
  readonly title?: string;
  readonly serviceOptions: readonly { readonly value: string; readonly label: string }[];
};

const EMPTY: Record<TextField, string> = { name: "", organisation: "", email: "", phone: "", service_type: "", message: "" };
const ALL_TOUCHED: Record<Field, boolean> = {
  name: true,
  organisation: true,
  email: true,
  phone: true,
  service_type: true,
  message: true,
  consent: true,
};

/**
 * Figma Contact "Form Card" (B7, `source=contact`). Errors show after blur or submit and focus
 * moves to the first invalid field; the result is announced through aria-live and success
 * replaces the form. Consent is required here (server `accepted_if:source,contact`).
 */
export function ContactForm({ title, serviceOptions }: ContactFormProps) {
  const t = useTranslations("ContactPage.form");
  const locale = useLocale() as AppLocale;
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [attempt, setAttempt] = useState(0);

  const clientErrors: Partial<Record<Field, string>> = {
    name: values.name.trim() ? undefined : t("nameRequired"),
    email: isValidEmail(values.email) ? undefined : t("emailInvalid"),
    phone: !values.phone.trim() || isValidSaudiMobile(values.phone) ? undefined : t("phoneInvalid"),
    message: values.message.length <= INQUIRY_LIMITS.message ? undefined : t("messageTooLong"),
    consent: consent ? undefined : t("consentRequired"),
  };
  const errorFor = (field: Field) => (touched[field] ? clientErrors[field] : undefined) ?? serverErrors[field];
  const hasClientErrors = Object.values(clientErrors).some(Boolean);

  useEffect(() => {
    if (attempt > 0) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }
  }, [attempt]);

  const bind = (field: TextField) => ({
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
    if (status.kind === "submitting") {
      return;
    }
    setTouched(ALL_TOUCHED);
    if (hasClientErrors) {
      setAttempt((current) => current + 1);
      return;
    }
    setStatus({ kind: "submitting" });
    try {
      const response = await postInquiry(locale, {
        name: values.name.trim(),
        organisation: values.organisation.trim() || undefined,
        email: values.email.trim(),
        phone: values.phone.trim() ? normalizePhone(values.phone) : undefined,
        service_type: values.service_type || undefined,
        message: values.message.trim() || undefined,
        consent: true,
        source: "contact",
        website,
      });
      setStatus({ kind: "success", message: response.message });
    } catch (error) {
      if (error instanceof ApiError && error.status === 422 && error.errors) {
        const failed = error.errors;
        setServerErrors({
          name: failed.name ? t("nameRequired") : undefined,
          email: failed.email ? t("emailInvalid") : undefined,
          phone: failed.phone ? t("phoneInvalid") : undefined,
          service_type: failed.service_type ? t("serviceInvalid") : undefined,
          message: failed.message ? t("messageTooLong") : undefined,
          consent: failed.consent ? t("consentRequired") : undefined,
        });
        setAttempt((current) => current + 1);
      }
      const tooMany = error instanceof ApiError && error.status === 429;
      setStatus({ kind: "error", message: tooMany ? t("tooMany") : t("error") });
    }
  }

  const consentError = errorFor("consent");

  return (
    <div className="flex flex-col gap-4 rounded-[24px] border border-line bg-elevated px-5 py-6 md:gap-6 md:rounded-[28px] md:p-10" data-testid="contact-form-card">
      {title ? <h2 className="font-display text-h3 text-primary md:text-h2">{title}</h2> : null}
      {status.kind === "success" ? (
        <p aria-live="polite" className="flex items-start gap-3 text-body-l text-primary" role="status">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-strong/16 text-accent">
            <Icon name="check" />
          </span>
          {status.message}
        </p>
      ) : (
        <form className="flex flex-col gap-4 md:gap-6" noValidate onSubmit={onSubmit} ref={formRef}>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField autoComplete="name" id={`${id}-name`} label={t("nameLabel")} maxLength={INQUIRY_LIMITS.name} placeholder={t("namePlaceholder")} required {...bind("name")} />
            <InputField
              autoComplete="organization"
              id={`${id}-organisation`}
              label={t("organisationLabel")}
              maxLength={INQUIRY_LIMITS.organisation}
              placeholder={t("organisationPlaceholder")}
              {...bind("organisation")}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField
              autoComplete="email"
              dir="ltr"
              id={`${id}-email`}
              inputClassName="rtl:text-right"
              inputMode="email"
              label={t("emailLabel")}
              maxLength={INQUIRY_LIMITS.email}
              placeholder={t("emailPlaceholder")}
              required
              type="email"
              {...bind("email")}
            />
            <InputField
              autoComplete="tel"
              dir="ltr"
              id={`${id}-phone`}
              inputClassName="rtl:text-right"
              inputMode="tel"
              label={t("phoneLabel")}
              maxLength={20}
              placeholder={t("phonePlaceholder")}
              type="tel"
              {...bind("phone")}
            />
          </div>
          <SelectField id={`${id}-service`} label={t("serviceLabel")} {...bind("service_type")}>
            <option value="">{t("servicePlaceholder")}</option>
            {serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
          <TextAreaField
            heightClassName="min-h-14.5 field-sizing-content max-h-80"
            id={`${id}-message`}
            label={t("messageLabel")}
            maxLength={INQUIRY_LIMITS.message}
            placeholder={t("messagePlaceholder")}
            rows={1}
            {...bind("message")}
          />
          <div className="flex flex-col gap-2">
            <label className="flex min-h-6 cursor-pointer items-start gap-2.5 text-body-s text-secondary" htmlFor={`${id}-consent`}>
              <input
                aria-describedby={consentError ? `${id}-consent-message` : undefined}
                aria-invalid={consentError ? true : undefined}
                checked={consent}
                className={classNames(
                  "mt-0.5 size-4.5 shrink-0 cursor-pointer rounded-[5px] accent-accent-strong",
                  consentError && "outline-2 outline-offset-2 outline-danger",
                )}
                id={`${id}-consent`}
                name="consent"
                onChange={(event) => {
                  setConsent(event.target.checked);
                  setServerErrors((current) => ({ ...current, consent: undefined }));
                }}
                required
                type="checkbox"
              />
              <span>
                {t("consent")}
                <span aria-hidden="true"> *</span>
              </span>
            </label>
            {consentError ? (
              <p className="text-caption text-danger" id={`${id}-consent-message`}>
                {consentError}
              </p>
            ) : null}
          </div>
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
      )}
    </div>
  );
}
