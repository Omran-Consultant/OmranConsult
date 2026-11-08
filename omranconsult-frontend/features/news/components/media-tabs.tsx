"use client";

import { useLocale } from "next-intl";
import { useRef, type KeyboardEvent } from "react";

import { filterChipClassName } from "@/core/ui/filter-chip";
import { Link, useRouter } from "@/i18n/navigation";

type MediaTab = { readonly id: string; readonly label: string; readonly href: string; readonly selected: boolean };

type MediaTabsProps = {
  readonly label: string;
  readonly panelId: string;
  readonly tabs: readonly MediaTab[];
};

/**
 * Category tabs (FIGMA §6.7, `role="tablist"`). Each tab is a real link, so the filter works
 * without JavaScript. Arrow keys follow the reading direction (in RTL the left arrow is "next"),
 * Home and End jump to the ends; moving focus also selects the tab.
 */
export function MediaTabs({ label, panelId, tabs }: MediaTabsProps) {
  const router = useRouter();
  const rtl = useLocale() === "ar";
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    const next = rtl ? "ArrowLeft" : "ArrowRight";
    const previous = rtl ? "ArrowRight" : "ArrowLeft";
    const target =
      event.key === next ? (index + 1) % tabs.length
      : event.key === previous ? (index - 1 + tabs.length) % tabs.length
      : event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : undefined;
    if (target === undefined) {
      return;
    }
    event.preventDefault();
    refs.current[target]?.focus();
    router.replace(tabs[target].href, { scroll: false });
  }

  return (
    <div aria-label={label} className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:flex-wrap md:px-0 md:pb-0" role="tablist">
      {tabs.map((tab, index) => (
        <Link
          aria-controls={panelId}
          aria-selected={tab.selected}
          className={filterChipClassName(tab.selected)}
          href={tab.href}
          id={tab.id}
          key={tab.id}
          onKeyDown={(event) => onKeyDown(event, index)}
          ref={(node) => {
            refs.current[index] = node;
          }}
          replace
          role="tab"
          scroll={false}
          tabIndex={tab.selected ? 0 : -1}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
