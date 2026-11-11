"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False in the server HTML and during hydration, true once React owns the page. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
