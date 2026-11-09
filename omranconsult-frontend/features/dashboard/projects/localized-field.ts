import type { AppLocale } from "@/i18n/routing";

export function readLocalizedField(value: unknown, locale: AppLocale): string {
  if (value == null) {
    return "";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        return readLocalizedField(JSON.parse(trimmed), locale);
      } catch {
        return value;
      }
    }
    return value;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const direct = record[locale];
    return typeof direct === "string" ? direct : "";
  }

  return "";
}

export function readLocalizedFieldPreferringLive(draft: unknown, live: unknown, locale: AppLocale): string {
  const fromDraft = readLocalizedField(draft, locale);
  if (fromDraft.trim() !== "") {
    return fromDraft;
  }
  return readLocalizedField(live, locale);
}
