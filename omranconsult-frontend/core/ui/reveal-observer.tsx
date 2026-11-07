"use client";

import { useEffect } from "react";

/**
 * Section reveal (motion table: 600 ms, stagger 80 ms). Marks every `[data-reveal]` element
 * with `data-revealed` once it enters the viewport. CSS in globals.css does the animation and
 * only hides content when `html.js` is set and motion is allowed.
 */
export function RevealObserver() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    const observe = () => {
      document.querySelectorAll("[data-reveal]:not([data-revealed])").forEach((node) => observer.observe(node));
    };
    observe();

    const mutations = new MutationObserver(observe);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}
