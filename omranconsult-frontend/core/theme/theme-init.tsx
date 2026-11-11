"use client";

import { themeInitScript } from "@/core/theme/theme-init-script";

/**
 * The pre-paint theme script, sent in the server HTML only. The browser runs it while parsing,
 * before the first paint. On the client this renders nothing: when React re-creates the tree
 * (the 404 page in development) a client-made <script> never runs and React reports it.
 * React 19 skips the server's extra <script> while hydrating.
 */
export function ThemeInit() {
  if (typeof window !== "undefined") {
    return null;
  }
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} id="theme-init" />;
}
