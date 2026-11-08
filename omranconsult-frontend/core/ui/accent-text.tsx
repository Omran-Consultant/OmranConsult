import { Fragment } from "react";

import { classNames } from "@/core/ui/class-names";
import { parseAccentText } from "@/core/text/accent-text";

type AccentTextProps = {
  readonly value: string;
  readonly accentClassName?: string;
  /** Classes for the line breaks, for example `max-md:hidden` to let narrow screens wrap freely. */
  readonly breakClassName?: string;
};

/** Renders seeded copy with its `{accent}` word and line breaks (no HTML from the API). */
export function AccentText({ value, accentClassName, breakClassName }: AccentTextProps) {
  const lines = parseAccentText(value);

  return (
    <>
      {lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 ? (
            <>
              {breakClassName ? " " : null}
              <br className={breakClassName} />
            </>
          ) : null}
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
