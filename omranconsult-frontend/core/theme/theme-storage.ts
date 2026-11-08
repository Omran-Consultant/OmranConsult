export const THEME_STORAGE_KEY = "oc-theme";

export type ThemePreference = "light" | "dark";

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseThemePreference(
  value: string | null | undefined,
): ThemePreference | null {
  if (value === "light" || value === "dark") {
    return value;
  }

  return null;
}

export function readStoredTheme(): ThemePreference | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return parseThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function readCookieTheme(): ThemePreference | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_STORAGE_KEY}=([^;]*)`),
  );

  if (!match?.[1]) {
    return null;
  }

  try {
    return parseThemePreference(decodeURIComponent(match[1]));
  } catch {
    return parseThemePreference(match[1]);
  }
}

/** Light is the default theme (A35); a stored choice wins. */
export const DEFAULT_THEME: ThemePreference = "light";

/** Client-only: localStorage → cookie → light default. */
export function readClientThemePreference(): ThemePreference {
  const fromStorage = readStoredTheme();
  if (fromStorage) {
    return fromStorage;
  }

  const fromCookie = readCookieTheme();
  if (fromCookie) {
    return fromCookie;
  }

  return resolveTheme(null);
}

export function writeStoredTheme(theme: ThemePreference): void {
  persistThemePreference(theme);
}

export function persistThemePreference(theme: ThemePreference): void {
  if (typeof document === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures (private mode, blocked storage).
  }

  document.cookie = `${THEME_STORAGE_KEY}=${theme};path=/;max-age=${THEME_COOKIE_MAX_AGE};SameSite=Lax`;
}

export function resolveTheme(stored: ThemePreference | null): ThemePreference {
  return stored ?? DEFAULT_THEME;
}

export function applyThemeClass(theme: ThemePreference): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function syncClientThemePreference(): ThemePreference {
  const theme = readClientThemePreference();
  applyThemeClass(theme);
  persistThemePreference(theme);
  return theme;
}
