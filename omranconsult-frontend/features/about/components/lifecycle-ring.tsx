import type { CSSProperties } from "react";

/** Three arcs of 106° with 14° gaps on a 380 box (r 140), clockwise from the top; a numbered node sits mid-arc. */
const ARCS = [
  { d: "M207.1 51.0 A140 140 0 0 1 318.9 244.7", node: { x: 311.2, y: 120 }, stroke: "stroke-green-300" },
  { d: "M301.8 274.3 A140 140 0 0 1 78.2 274.3", node: { x: 190, y: 330 }, stroke: "stroke-green-400" },
  { d: "M61.1 244.7 A140 140 0 0 1 172.9 51.0", node: { x: 68.8, y: 120 }, stroke: "stroke-green-500" },
] as const;

type LifecycleRingProps = {
  readonly line1: string;
  readonly line2: string;
  readonly className?: string;
};

/**
 * Decorative asset-lifecycle ring (work-stages concept C1). The arcs draw in once when the ring is
 * revealed (`data-reveal`, CSS in globals.css); nothing moves under reduced motion or without JS.
 */
export function LifecycleRing({ line1, line2, className }: LifecycleRingProps) {
  return (
    <div aria-hidden="true" className={`relative ${className ?? ""}`} data-lifecycle-ring="" data-reveal="">
      <svg className="size-full" fill="none" viewBox="0 0 380 380">
        <circle className="stroke-white/8" cx="190" cy="190" r="140" strokeWidth="20" />
        {ARCS.map((arc, index) => (
          <path
            className={arc.stroke}
            d={arc.d}
            data-ring-arc=""
            key={arc.d}
            pathLength={1}
            strokeLinecap="round"
            strokeWidth="20"
            style={{ "--arc-index": index } as CSSProperties}
          />
        ))}
        {ARCS.map((arc, index) => (
          <g key={arc.d}>
            <circle className={`fill-navy-900 ${arc.stroke}`} cx={arc.node.x} cy={arc.node.y} r="21" strokeWidth="3" />
            <text className="fill-white font-latin text-[15px] font-bold" textAnchor="middle" x={arc.node.x} y={arc.node.y + 5.5}>
              {String(index + 1).padStart(2, "0")}
            </text>
          </g>
        ))}
      </svg>
      <p className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center font-display text-body-m text-white">
        <span>{line1}</span>
        <span className="text-body-l text-green-300">{line2}</span>
      </p>
    </div>
  );
}
