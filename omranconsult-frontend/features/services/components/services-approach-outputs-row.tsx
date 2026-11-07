"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

type ServicesApproachOutputsRowProps = {
  readonly outputs: readonly string[];
  readonly ariaLabel: string;
  readonly nextLabel: string;
  readonly previousLabel: string;
};

function ChevronIcon({ flipped }: { readonly flipped: boolean }) {
  return (
    <svg aria-hidden className={flipped ? "scale-x-[-1]" : undefined} height="22" viewBox="0 0 24 24" width="22">
      <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function ServicesApproachOutputsRow({
  ariaLabel,
  nextLabel,
  outputs,
  previousLabel,
}: ServicesApproachOutputsRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const progressId = useId();
  const [progress, setProgress] = useState(20);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const syncProgress = useCallback(() => {
    const row = rowRef.current;
    if (!row) {
      return;
    }
    const maxScroll = row.scrollWidth - row.clientWidth;
    if (maxScroll <= 0) {
      setProgress(100);
      return;
    }
    const ratio = row.scrollLeft / maxScroll;
    setProgress(20 + ratio * 80);
  }, []);

  const scrollByStep = (direction: -1 | 1) => {
    const row = rowRef.current;
    if (!row) {
      return;
    }
    const step = Math.max(row.clientWidth * 0.75, 280);
    const rtl = document.documentElement.dir === "rtl";
    const signedStep = direction * step * (rtl ? -1 : 1);
    row.scrollBy({ left: signedStep, behavior: reducedMotion ? "auto" : "smooth" });
  };

  useEffect(() => {
    syncProgress();
  }, [outputs.length, syncProgress]);

  if (outputs.length < 4 || reducedMotion) {
    return (
      <ol className="mt-8 list-decimal space-y-3 ps-6 text-base leading-relaxed text-secondary">
        {outputs.map((output) => (
          <li key={output}>{output}</li>
        ))}
      </ol>
    );
  }

  return (
    <div className="mt-8">
      <div
        aria-hidden
        className="mb-8 h-1.5 overflow-hidden rounded-full bg-line"
        id={progressId}
      >
        <div
          className="h-full rounded-full bg-canvas motion-safe:transition-[width] motion-safe:duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div
        aria-label={ariaLabel}
        className="-mx-(--page-margin) flex snap-x snap-mandatory gap-8 overflow-x-auto px-page pb-2 [scrollbar-width:none] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent [&::-webkit-scrollbar]:hidden"
        onScroll={syncProgress}
        ref={rowRef}
        tabIndex={0}
      >
        {outputs.map((output) => (
          <article
            className="flex w-[min(300px,80vw)] shrink-0 snap-start flex-col"
            key={output}
          >
            <p className="text-base leading-relaxed text-secondary">{output}</p>
          </article>
        ))}
      </div>
      <div className="mt-6 flex gap-2 rtl:flex-row-reverse">
        <button
          className="grid size-13 place-items-center rounded-full border-0 bg-canvas text-white motion-safe:transition-[background-color,transform] motion-safe:duration-150 motion-safe:active:scale-95 motion-safe:hover:bg-accent-strong"
          onClick={() => scrollByStep(-1)}
          type="button"
        >
          <span className="sr-only">{previousLabel}</span>
          <ChevronIcon flipped />
        </button>
        <button
          className="grid size-13 place-items-center rounded-full border-0 bg-canvas text-white motion-safe:transition-[background-color,transform] motion-safe:duration-150 motion-safe:active:scale-95 motion-safe:hover:bg-accent-strong"
          onClick={() => scrollByStep(1)}
          type="button"
        >
          <span className="sr-only">{nextLabel}</span>
          <ChevronIcon flipped={false} />
        </button>
      </div>
    </div>
  );
}
