"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useState, type FormEvent } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { Spinner } from "@/core/ui/spinner";
import type { AppLocale } from "@/i18n/routing";
import { ApiError } from "@/lib/api/errors";
import { postNewsletterSubscription } from "@/lib/api/public-writes";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status =
  | { readonly kind: "idle" }
  | { readonly kind: "submitting" }
  | { readonly kind: "success"; readonly message: string }
  | { readonly kind: "error"; readonly message: string };

type NewsletterFormProps = {
  readonly className?: string;
  /** Visible label above the field (footer); the Media Center block passes its own layout. */
  readonly showLabel?: boolean;
};

/**
 * Newsletter subscription (POST /api/newsletter). Errors show after blur or submit and are
 * announced through aria-live; the consent sentence replaces a checkbox (PHASE4C Q12).
 */
export function NewsletterForm({ className, showLabel = true }: NewsletterFormProps) {
  const t = useTranslations("Layout.newsletter");
  const locale = useLocale() as AppLocale;
  const id = useId();
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const invalid = touched && !EMAIL_PATTERN.test(email.trim());
  const fieldError = invalid ? t("invalidEmail") : undefined;
  const message = fieldError ?? (status.kind === "error" || status.kind === "success" ? status.message : undefined);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!EMAIL_PATTERN.test(email.trim()) || status.kind === "submitting") {
      return;
    }
    setStatus({ kind: "submitting" });
    try {
      const response = await postNewsletterSubscription(locale, { email: email.trim(), consent: true });
      setStatus({ kind: "success", message: response.message });
      setEmail("");
      setTouched(false);
    } catch (error) {
      const tooMany = error instanceof ApiError && error.status === 429;
      setStatus({ kind: "error", message: tooMany ? t("tooMany") : t("error") });
    }
  }

  return (
    <form className={classNames("flex flex-col gap-2.5", className)} noValidate onSubmit={onSubmit}>
      <label className={classNames("text-label-s text-secondary", !showLabel && "sr-only")} htmlFor={`${id}-email`}>
        {t("emailLabel")}
      </label>
      <div className="relative">
        <input
          aria-describedby={`${id}-consent ${id}-message`}
          aria-invalid={invalid || undefined}
          autoComplete="email"
          className={classNames(
            "w-full rounded-md border bg-glass py-4 ps-[18px] pe-14 text-body-m text-primary transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-accent/20 focus:outline-none",
            invalid ? "border-danger" : "border-line-strong",
          )}
          id={`${id}-email`}
          inputMode="email"
          name="email"
          onBlur={() => setTouched(email.length > 0)}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("emailPlaceholder")}
          required
          type="email"
          value={email}
        />
        <button
          aria-busy={status.kind === "submitting" || undefined}
          aria-label={t("submit")}
          className="absolute inset-y-1.5 end-1.5 flex w-11 items-center justify-center rounded-full bg-accent-strong text-white transition-colors duration-150 hover:bg-green-700 disabled:opacity-40"
          disabled={status.kind === "submitting"}
          type="submit"
        >
          {status.kind === "submitting" ? <Spinner /> : <Icon name="arrow" />}
        </button>
      </div>
      <p className="text-caption text-muted" id={`${id}-consent`}>
        {t("consent")}
      </p>
      <p
        aria-live="polite"
        className={classNames("text-caption", fieldError || status.kind === "error" ? "text-danger" : "text-accent")}
        id={`${id}-message`}
      >
        {message}
      </p>
    </form>
  );
}
