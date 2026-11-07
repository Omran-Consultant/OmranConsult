"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { classNames } from "@/core/ui/class-names";
import { SECTION_BACKGROUND_IMAGES, getProfileImageAlt } from "@/features/media/profile-images";
import type { AppLocale } from "@/i18n/routing";

type EducationGoalItem = {
  readonly lead?: string;
  readonly body?: string;
};

type EducationGoalsStepperProps = {
  readonly locale: AppLocale;
  readonly sectionTitle?: string;
  readonly items: readonly EducationGoalItem[];
};

export function EducationGoalsStepper({ items, locale, sectionTitle }: EducationGoalsStepperProps) {
  const background = SECTION_BACKGROUND_IMAGES.education_goals;
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [isMobile, setIsMobile] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      setReducedMotion(motion.matches);
      setIsMobile(narrow.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    narrow.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
    };
  }, []);

  const usePlainList = reducedMotion || isMobile;

  const markers = useMemo(() => items.map((_, index) => index), [items]);

  useEffect(() => {
    if (usePlainList || !containerRef.current) {
      return;
    }

    const root = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) {
          return;
        }
        const index = Number(visible.target.getAttribute("data-goal-index"));
        if (!Number.isNaN(index)) {
          setActiveIndex(index);
        }
      },
      { root: null, threshold: [0.35, 0.55, 0.75], rootMargin: "-20% 0px -35% 0px" },
    );

    for (const marker of root.querySelectorAll("[data-goal-marker]")) {
      observer.observe(marker);
    }

    return () => observer.disconnect();
  }, [items.length, usePlainList]);

  if (usePlainList) {
    return (
      <div className="px-(--oc-page-margin) py-(--oc-section-y)">
        {sectionTitle ? (
          <h2 className="font-display mb-8 text-(--text-oc-h2) font-bold text-heading">{sectionTitle}</h2>
        ) : null}
        <ol className="space-y-8">
          {items.map((item, index) => (
            <li className="border-b border-border-strong pb-8" key={`${item.lead ?? "goal"}-${index}`}>
              <p className="font-display text-xl font-bold text-heading">
                <span className="me-2 text-brand-green-strong">{index + 1}.</span>
                {item.lead}
              </p>
              {item.body ? <p className="mt-3 text-base leading-relaxed text-muted">{item.body}</p> : null}
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="relative bg-brand-navy-deep text-white" ref={containerRef} style={{ height: `${Math.max(items.length + 1, 4) * 70}vh` }}>
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden">
        <Image
          alt={getProfileImageAlt(background, locale)}
          className="absolute inset-0 h-full w-full object-cover"
          fill
          sizes="100vw"
          src={background.src}
        />
        <div aria-hidden className="absolute inset-0 bg-brand-navy/55" />
        <ol className="relative z-10 mx-(--oc-page-margin) mt-[12vh] flex max-w-[min(620px,56vw)] flex-col gap-2.5">
          {sectionTitle ? (
            <li className="list-none">
              <h2 className="mb-3 text-2xl font-bold text-brand-green-light">{sectionTitle}</h2>
            </li>
          ) : null}
          {items.map((item, index) => {
            const active = index === activeIndex;
            return (
              <li
                className={classNames(
                  "list-none font-display text-lg font-bold leading-snug transition-colors",
                  active ? "text-white" : "text-muted-on-dark",
                )}
                key={`${item.lead ?? "goal"}-${index}`}
              >
                {item.lead}
                {item.body ? (
                  <p
                    className={classNames(
                      "mt-1.5 overflow-hidden font-sans text-base font-normal leading-relaxed text-white transition-[max-height,margin]",
                      active ? "max-h-40" : "max-h-0",
                    )}
                  >
                    {item.body}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
      {markers.map((index) => (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 h-[70vh]"
          data-goal-marker
          data-goal-index={index}
          key={index}
          style={{ top: `${index * 70}vh` }}
        />
      ))}
    </div>
  );
}
