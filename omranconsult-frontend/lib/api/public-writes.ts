import { browserApiRequest } from "@/lib/api/browser-client";
import type { AppLocale } from "@/i18n/routing";

/** Server confirmation for public writes (SDD §7.2): a short message in the request locale. */
export type PublicWriteResponse = {
  readonly message: string;
};

export type NewsletterRequest = {
  readonly email: string;
  readonly consent: true;
};

export type InquiryRequest = {
  readonly name: string;
  readonly email: string;
  readonly organisation?: string;
  readonly phone?: string;
  readonly service_type?: string;
  readonly message?: string;
  readonly consent?: boolean;
  readonly source: "contact" | "project";
  readonly project_slug?: string;
  /** Honeypot: always empty for people. */
  readonly website?: string;
};

function localeHeaders(locale: AppLocale): HeadersInit {
  return { "Accept-Language": locale };
}

/** POST /api/newsletter (idempotent: 201 new, 200 known). Not retried: it is a write. */
export function postNewsletterSubscription(locale: AppLocale, body: NewsletterRequest) {
  return browserApiRequest<PublicWriteResponse>("/api/newsletter", {
    method: "POST",
    json: body,
    headers: localeHeaders(locale),
  });
}

/** POST /api/inquiries (contact page and project inquiry card). Not retried: it is a write. */
export function postInquiry(locale: AppLocale, body: InquiryRequest) {
  return browserApiRequest<PublicWriteResponse>("/api/inquiries", {
    method: "POST",
    json: body,
    headers: localeHeaders(locale),
  });
}
