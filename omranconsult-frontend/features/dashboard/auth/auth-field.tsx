"use client";

import { useTranslations } from "next-intl";
import { useState, type InputHTMLAttributes } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon, type IconName } from "@/core/ui/icon";

type AuthFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className" | "type"> & {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly type?: "email" | "password" | "text";
};

const CONTROL_CLASS =
  "h-[52px] w-full rounded-xl border border-line-strong bg-white ps-12 text-body-m text-primary transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-accent focus:ring-4 focus:ring-accent/14 focus:outline-none disabled:opacity-40";

export function AuthField({ id, label, icon, type = "text", required, ...rest }: AuthFieldProps) {
  const t = useTranslations("Dashboard.login");
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-2">
      <label className="text-label-s text-primary" htmlFor={id}>
        {label}
      </label>
      <div className="relative flex items-center">
        <Icon className="pointer-events-none absolute start-4 text-muted" name={icon} />
        <input
          className={classNames(CONTROL_CLASS, isPassword ? "pe-12" : "pe-4")}
          id={id}
          required={required}
          type={isPassword && visible ? "text" : type}
          {...rest}
        />
        {isPassword ? (
          <button
            aria-label={visible ? t("hidePassword") : t("showPassword")}
            className="absolute end-3 rounded-md p-1 text-muted hover:text-primary"
            onClick={() => setVisible((value) => !value)}
            type="button"
          >
            <Icon name={visible ? "eye-slash" : "eye"} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
