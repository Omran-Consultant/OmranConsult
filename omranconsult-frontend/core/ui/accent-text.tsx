import { Fragment } from "react";

import { classNames } from "@/core/ui/class-names";
import { parseAccentText } from "@/core/text/accent-text";

type AccentTextProps = {
  readonly value: string;
  readonly accentClassName?: string;
};

/** Renders seeded copy with its `{accent}` word and line breaks (no HTML from the API). */
export function AccentText({ value, accentClassName }: AccentTextProps) {
  const lines = parseAccentText(value);

  return (
    <>
      {lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 ? <br /> : null}
          {line.map((segment, segmentIndex) =>
            segment.accent ? (
              <span className={classNames("text-accent", accentClassName)} key={segmentIndex}>
                {segment.text}
              </span>
            ) : (
              <Fragment key={segmentIndex}>{segment.text}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}
