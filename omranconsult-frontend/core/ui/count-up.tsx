"use client";

import { useEffect, useRef, useState } from "react";

import { classNames } from "@/core/ui/class-names";

type CountUpProps = {
  /** Final text, for example "204+" or "15B+". Rendered as-is without JS or with reduced motion. */
  readonly value: string;
  readonly className?: string;
};

const DURATION_MS = 1200;

function splitNumeric(value: string): { number: number; decimals: number; prefix: string; rest: string } | undefined {
  const match = value.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) {
    return undefined;
  }
  const raw = (match[2] ?? "").replaceAll(",", "");
  const number = Number.parseFloat(raw);
  if (!Number.isFinite(number)) {
    return undefined;
  }
  return { number, decimals: raw.split(".")[1]?.length ?? 0, prefix: match[1] ?? "", rest: match[3] ?? "" };
}

/** Count-up from 0 when the number enters the screen (1200 ms ease-out, motion table). */
export function CountUp({ value, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const node = ref.current;
    const parts = splitNumeric(value);
    if (!node || !parts || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const grouping = value.includes(",");
    const format = (current: number) =>
      new Intl.NumberFormat("en", {
        maximumFractionDigits: parts.decimals,
        minimumFractionDigits: parts.decimals,
        useGrouping: grouping,
      }).format(current);

    let frame = 0;
    let startedAt: number | undefined;

    const tick = (now: number) => {
      startedAt ??= now;
      const progress = Math.min(1, (now - startedAt) / DURATION_MS);
      const eased = 1 - (1 - progress) ** 3;
      setShown(`${parts.prefix}${format(parts.number * eased)}${parts.rest}`);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setShown(value);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          frame = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span className={classNames("num-isolate self-start", className)} dir="ltr" ref={ref}>
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
