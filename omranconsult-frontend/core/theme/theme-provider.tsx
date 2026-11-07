"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  applyThemeClass,
  DEFAULT_THEME,
  persistThemePreference,
  readClientThemePreference,
  type ThemePreference,
} from "@/core/theme/theme-storage";

const THEME_CHANGE_EVENT = "oc-theme-change";

type ThemeContextValue = {
  theme: ThemePreference;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getThemeSnapshot(): ThemePreference {
  return readClientThemePreference();
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => {
    applyThemeClass(readClientThemePreference());
    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(THEME_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(THEME_CHANGE_EVENT, handleChange);
  };
}

function publishThemeChange(): void {
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<ThemePreference>(
    subscribe,
    getThemeSnapshot,
    () => DEFAULT_THEME,
  );

  const toggleTheme = useCallback(() => {
    const next: ThemePreference =
      readClientThemePreference() === "dark" ? "light" : "dark";
    persistThemePreference(next);
    applyThemeClass(next);
    publishThemeChange();
  }, []);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
