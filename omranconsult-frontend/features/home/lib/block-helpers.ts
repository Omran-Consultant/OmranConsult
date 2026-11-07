export function asObject(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }
  return value as Record<string, unknown>;
}

export function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

export function asStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

export function firstBodyParagraph(value: unknown): string | undefined {
  const block = asObject(value);
  const body = block?.body;
  if (!Array.isArray(body) || body.length === 0) {
    return undefined;
  }
  return asString(body[0]);
}

export function secondBodyParagraph(value: unknown): string | undefined {
  const block = asObject(value);
  const body = block?.body;
  if (!Array.isArray(body) || body.length < 2) {
    return undefined;
  }
  return asString(body[1]);
}

/** Split display headlines into balanced lines without inventing copy. */
export function splitDisplayHeadline(headline: string): readonly string[] {
  const trimmed = headline.trim();
  if (trimmed.includes("\n")) {
    return trimmed.split("\n").map((line) => line.trim()).filter(Boolean);
  }
  const words = trimmed.split(/\s+/);
  if (words.length <= 3) {
    return [trimmed];
  }
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

export function headquartersCaption(address: string | undefined, locale: "ar" | "en"): string | undefined {
  if (!address?.trim()) {
    return undefined;
  }
  const segment = address.split(/[,،]/)[0]?.trim();
  if (!segment) {
    return undefined;
  }
  return locale === "ar" ? `المقر: ${segment}` : `HQ: ${segment}`;
}
