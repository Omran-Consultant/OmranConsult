import { classNames } from "@/core/ui/class-names";

/** Loading placeholder: bg/elevated with a shimmer (spec, no full-page spinner). */
export function Skeleton({ className }: { readonly className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={classNames(
        "block animate-[shimmer_1.6s_linear_infinite] rounded-md bg-elevated bg-linear-to-r from-elevated via-highlight to-elevated bg-size-[200%_100%] motion-reduce:animate-none",
        className,
      )}
    />
  );
}
