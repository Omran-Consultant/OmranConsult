type WordmarkStripProps = {
  readonly label?: string;
  readonly items: readonly { readonly key: string; readonly wordmark: string; readonly title?: string }[];
};

/** Figma Trust logo strip: label, then uniform Latin wordmarks (PHASE4C_HOME_REVIEW H6). */
export function WordmarkStrip({ label, items }: WordmarkStripProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 border-t border-line pt-10 md:flex-row md:items-center md:gap-14">
      {label ? <h3 className="shrink-0 text-label-m text-secondary">{label}</h3> : null}
      <ul className="grid grid-cols-2 gap-x-6 gap-y-4 md:flex md:flex-1 md:flex-wrap md:items-center md:justify-between md:gap-x-10">
        {items.map((item) => (
          <li key={item.key}>
            <span
              className="font-latin text-[1.375rem] leading-none font-semibold tracking-[0.04em] text-muted uppercase transition-colors duration-150 hover:text-primary"
              dir="ltr"
              lang="en"
              title={item.title}
            >
              {item.wordmark}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
