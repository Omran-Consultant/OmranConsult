import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { Spinner } from "@/core/ui/spinner";
import { Link } from "@/i18n/navigation";

export type ButtonVariant = "primary" | "secondary" | "light" | "ghost";

type CommonProps = {
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  /** Shows the Figma arrow (down-left in RTL, mirrored in LTR). */
  readonly arrow?: boolean;
  readonly className?: string;
};

/*
 * States follow the spec's states table. Deliberate deviation (PHASE4C Q7, WCAG AA):
 * Primary hover is green/700 instead of green/500 (white text 3.38:1).
 */
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  // Figma button height is 55px (padding 16/28 with Label/M was rendering ~53).
  primary:
    "h-[55px] bg-accent-strong px-7 text-white hover:bg-green-700 active:scale-[.98] active:bg-green-700",
  secondary:
    "h-[55px] border border-line-strong px-7 text-primary hover:border-accent hover:bg-tint active:border-primary active:bg-tint-strong",
  light: "h-[55px] bg-white px-7 text-navy-950 hover:bg-neutral-100 active:bg-neutral-300",
  ghost: "py-1.5 text-accent hover:text-primary",
};

const ICON_CLASS: Record<ButtonVariant, string> = {
  primary: "",
  secondary: "",
  light: "",
  ghost: "text-accent",
};

const BASE_CLASS =
  "inline-flex items-center justify-center gap-3 rounded-full text-label-m whitespace-nowrap transition-[color,background-color,border-color,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40";

export function buttonClassName(variant: ButtonVariant = "primary", className?: string): string {
  return classNames(BASE_CLASS, VARIANT_CLASS[variant], className);
}

function Content({ children, arrow, variant }: Pick<CommonProps, "children" | "arrow"> & { variant: ButtonVariant }) {
  return (
    <>
      <span>{children}</span>
      {arrow ? <Icon className={ICON_CLASS[variant]} name="arrow" /> : null}
    </>
  );
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    /** Replaces the label with a spinner and keeps the width (aria-busy). */
    readonly loading?: boolean;
  };

export function Button({
  children,
  variant = "primary",
  arrow = false,
  loading = false,
  className,
  type = "button",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      aria-busy={loading || undefined}
      className={buttonClassName(variant, classNames("relative", className))}
      disabled={disabled || loading}
      type={type}
      {...rest}
    >
      <span className={classNames("inline-flex items-center gap-3", loading && "invisible")}>
        <Content arrow={arrow} variant={variant}>
          {children}
        </Content>
      </span>
      {loading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      ) : null}
    </button>
  );
}

type LinkButtonProps = CommonProps & {
  readonly href: string;
  /** `false` keeps the scroll position (for example «عرض المزيد»). */
  readonly scroll?: boolean;
};

/** In-app navigation (locale-aware). */
export function LinkButton({ href, children, variant = "primary", arrow = false, className, scroll }: LinkButtonProps) {
  return (
    <Link className={buttonClassName(variant, className)} href={href} scroll={scroll}>
      <Content arrow={arrow} variant={variant}>
        {children}
      </Content>
    </Link>
  );
}

type AnchorButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
    readonly href: string;
  };

/** External or file links (for example the profile PDF). */
export function AnchorButton({ children, variant = "primary", arrow = false, className, ...rest }: AnchorButtonProps) {
  return (
    <a className={buttonClassName(variant, className)} {...rest}>
      <Content arrow={arrow} variant={variant}>
        {children}
      </Content>
    </a>
  );
}
