"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1 && element.getClientRects().length > 0,
  );
}

type UseFocusTrapOptions = {
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  restoreFocusRef?: RefObject<HTMLElement | null>;
};

export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
  restoreFocusRef,
}: UseFocusTrapOptions): void {
  const wasActiveRef = useRef(false);

  useEffect(() => {
    if (!active) {
      if (wasActiveRef.current) {
        restoreFocusRef?.current?.focus();
      }
      wasActiveRef.current = false;
      return;
    }

    wasActiveRef.current = true;
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const focusTarget =
      initialFocusRef?.current ??
      getFocusableElements(container)[0] ??
      container;

    focusTarget.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusables = getFocusableElements(container);

      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      // Move focus here on every Tab: Safari's default Tab order skips links, so leaving the
      // step to the browser lets focus escape the dialog between the first and last element.
      event.preventDefault();
      const index = focusables.indexOf(document.activeElement as HTMLElement);
      const step = event.shiftKey ? -1 : 1;
      const next = index === -1 ? (event.shiftKey ? focusables.length - 1 : 0) : (index + step + focusables.length) % focusables.length;
      focusables[next]?.focus();
    };

    container.addEventListener("keydown", onKeyDown);

    return () => {
      container.removeEventListener("keydown", onKeyDown);
    };
  }, [active, containerRef, initialFocusRef, restoreFocusRef]);
}
