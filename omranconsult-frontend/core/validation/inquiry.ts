/** Client mirror of StoreInquiryRequest (B7); the server stays the authority. */
export const INQUIRY_LIMITS = { name: 120, organisation: 160, email: 190, message: 2000 } as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAUDI_MOBILE_PATTERN = /^(05\d{8}|\+9665\d{8})$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/** 05XXXXXXXX or +9665XXXXXXXX; spaces and dashes are ignored, as on the server. */
export function isValidSaudiMobile(value: string): boolean {
  return SAUDI_MOBILE_PATTERN.test(normalizePhone(value));
}

export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, "");
}
