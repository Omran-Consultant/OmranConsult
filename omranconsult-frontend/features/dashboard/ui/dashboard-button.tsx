import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

import { classNames } from "@/core/ui/class-names";
import { Spinner } from "@/core/ui/spinner";

export type DashboardButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASS: Record<DashboardButtonVariant, string> = {
  primary: "bg-accent-strong text-white hover:bg-green-700",
  secondary: "border border-line bg-elevated text-primary hover:bg-highlight",
  ghost: "text-accent hover:bg-highlight",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const DISABLED_CLASS: Record<DashboardButtonVariant, string> = {
  primary: "bg-accent-strong/70 text-white",
  secondary: "border border-line bg-highlight text-secondary",
  ghost: "text-secondary",
  danger: "bg-danger/70 text-white",
};

export function dashboardButtonClassName(
  variant: DashboardButtonVariant = "primary",
  className?: string,
  disabled = false,
) {
  return classNames(
    "inline-flex h-[var(--control-md-height)] min-h-[var(--control-md-height)] items-center justify-center gap-2",
    "rounded-[var(--control-radius)] px-4 sm:px-5 text-label-s whitespace-nowrap",
    "transition-[color,background-color,border-color] duration-150",
    "focus-visible:ring-3 focus-visible:ring-accent/20 focus-visible:outline-none",
    disabled ? DISABLED_CLASS[variant] : VARIANT_CLASS[variant],
    disabled ? "cursor-not-allowed" : "cursor-pointer",
    className,
  );
}

type CommonProps = {
  readonly children: ReactNode;
  readonly variant?: DashboardButtonVariant;
  readonly icon?: ReactNode;
  readonly disabledReason?: string;
  readonly className?: string;
};

type DashboardButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    readonly loading?: boolean;
  };

export function DashboardButton({
  children,
  variant = "primary",
  icon,
  disabledReason,
  className,
  loading = false,
  type = "button",
  disabled,
  title,
  onClick,
  ...rest
}: DashboardButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  const tooltip = disabledReason ?? title;

  return (
    <button
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={dashboardButtonClassName(variant, className, isDisabled)}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      title={tooltip}
      type={type}
      {...rest}
    >
      {loading ? <Spinner /> : icon}
      <span>{children}</span>
    </button>
  );
}

export function DashboardLinkButton({
  href,
  children,
  variant = "primary",
  icon,
  className,
  title,
}: CommonProps & { href: string; title?: string }) {
  return (
    <Link className={dashboardButtonClassName(variant, className)} href={href} title={title}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}
