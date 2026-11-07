import type { ReactNode } from "react";

type StatProps = {
  readonly value: string;
  readonly label?: string;
  readonly unit?: ReactNode;
};

export function Stat({ value, label, unit }: StatProps) {
  return (
    <div className="space-y-2">
      <p className="font-display text-4xl font-semibold tracking-tight [unicode-bidi:isolate] md:text-5xl" dir="ltr">
        {value}
        {unit ? <span className="ms-2 text-base font-medium opacity-85">{unit}</span> : null}
      </p>
      {label ? <p className="text-sm text-muted">{label}</p> : null}
    </div>
  );
}
