import { classNames } from "@/core/ui/class-names";

/** 20 px spinner for the button Loading state. Decorative: the button carries aria-busy. */
export function Spinner({ className }: { readonly className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={classNames("size-5 animate-spin motion-reduce:animate-none", className)}
      fill="none"
      viewBox="0 0 20 20"
    >
      <circle cx="10" cy="10" opacity="0.25" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M18 10a8 8 0 0 0-8-8" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
