import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { Link } from "@/i18n/navigation";

type ButtonVariant = "solid" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
};

type LinkButtonProps = {
  readonly href: string;
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  readonly className?: string;
};

const variantClassName: Record<ButtonVariant, string> = {
  solid:
    "bg-brand-green-strong text-white hover:bg-brand-green focus-visible:outline-brand-green-strong dark:bg-brand-green-light dark:text-brand-navy",
  outline:
    "border border-border-strong bg-transparent text-foreground hover:bg-surface-muted focus-visible:outline-ring",
  ghost: "bg-transparent text-foreground hover:bg-surface-muted focus-visible:outline-ring",
};

const baseClassName =
  "inline-flex min-h-11 items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

export function Button({ children, className, variant = "solid", type = "button", ...rest }: ButtonProps) {
  return (
    <button className={classNames(baseClassName, variantClassName[variant], className)} type={type} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({ href, children, variant = "solid", className }: LinkButtonProps) {
  return (
    <Link className={classNames(baseClassName, variantClassName[variant], className)} href={href}>
      {children}
    </Link>
  );
}
