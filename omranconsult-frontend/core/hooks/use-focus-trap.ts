"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1,
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

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last?.focus();
        return;
      }

      if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);

    return () => {
      container.removeEventListener("keydown", onKeyDown);
    };
  }, [active, containerRef, initialFocusRef, restoreFocusRef]);
}
