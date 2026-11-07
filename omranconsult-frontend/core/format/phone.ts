const PHONE_SPACING = /(\+\d{3})(\d{2})(\d{3})(\d{4})/;

export function formatPhoneForDisplay(raw: string): string {
  const normalized = raw.replace(/\s+/g, "");
  const spaced = normalized.match(PHONE_SPACING);
  if (spaced) {
    return `${spaced[1]} ${spaced[2]} ${spaced[3]} ${spaced[4]}`;
  }

  return raw;
}

export function formatPhoneTelLink(raw: string): string {
  return raw.replace(/\s+/g, "");
}
