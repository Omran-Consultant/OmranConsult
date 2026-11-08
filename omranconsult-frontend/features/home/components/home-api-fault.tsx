"use client";

const FAULT_COOKIE = "x-omran-api=down";

/**
 * The home page is prerendered, so a Playwright route abort never reaches its server fetch.
 * The e2e intercept sets this cookie; the throw is caught by the locale error boundary.
 */
export function HomeApiFault() {
  if (typeof document !== "undefined" && document.cookie.includes(FAULT_COOKIE)) {
    throw new Error("API unreachable");
  }

  return null;
}
