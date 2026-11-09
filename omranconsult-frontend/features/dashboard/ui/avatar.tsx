import Image from "next/image";

import { classNames } from "@/core/ui/class-names";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function Avatar({
  name,
  src,
  className,
  size = 40,
}: {
  name: string;
  src?: string | null;
  className?: string;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        alt=""
        className={classNames("rounded-full object-cover", className)}
        height={size}
        src={src}
        width={size}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={classNames(
        "inline-grid shrink-0 place-items-center rounded-full bg-accent/12 font-medium text-accent",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {initials(name)}
    </span>
  );
}
