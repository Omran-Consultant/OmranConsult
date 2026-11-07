"use client";

import { useEffect, useRef, useState } from "react";

import { classNames } from "@/core/ui/class-names";

type StatCountUpProps = {
  readonly className?: string;
  readonly displayValue: string;
  readonly endValue: number;
  readonly suffix?: string;
};

function parseDisplayNumeric(displayValue: string): number | undefined {
  const match = displayValue.match(/^[\d,.]+/);
  if (!match) {
    return undefined;
  }
  const normalized = match[0].replaceAll(",", "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function StatCountUp({ className, displayValue, endValue, suffix }: StatCountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(displayValue);
  const numericFromDisplay = parseDisplayNumeric(displayValue);
  const target = numericFromDisplay ?? endValue;

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !Number.isFinite(target)) {
      return;
    }

    let frame = 0;
    const durationMs = 1600;
    let startedAt: number | undefined;

    const tick = (now: number) => {
      if (startedAt === undefined) {
        startedAt = now;
      }
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - (1 - progress) ** 3;
      const current = Math.round(target * eased);
      const formatted = new Intl.NumberFormat(undefined, {
        numberingSystem: "latn",
        maximumFractionDigits: 0,
      }).format(current);
      const scalePart = displayValue.replace(/^[\d,.]+/, "").replace(suffix ?? "", "");
      setShown(`${formatted}${scalePart}${suffix ?? ""}`);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          frame = requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [displayValue, suffix, target]);

  return (
    <span className={classNames("num-isolate", className)} dir="ltr" ref={ref}>
      {shown}
    </span>
  );
}
