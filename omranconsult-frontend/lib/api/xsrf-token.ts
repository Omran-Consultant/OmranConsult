/**
 * Parse Laravel's XSRF-TOKEN value from a Cookie header or document.cookie string.
 */
export function readXsrfTokenFromCookieString(cookieString: string): string | null {
  const cookies = cookieString.split(";");

  for (const part of cookies) {
    const [rawName, ...rawValueParts] = part.trim().split("=");
    if (rawName?.trim() !== "XSRF-TOKEN") {
      continue;
    }

    const rawValue = rawValueParts.join("=");
    if (!rawValue) {
      return null;
    }

    try {
      return decodeURIComponent(rawValue);
    } catch {
      return rawValue;
    }
  }

  return null;
}

export function readXsrfTokenFromDocument(): string | null {
  if (typeof document === "undefined") {
    return null;
  }

  return readXsrfTokenFromCookieString(document.cookie);
}
