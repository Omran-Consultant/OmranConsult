"use client";

import { useTranslations } from "next-intl";

import { classNames } from "@/core/ui/class-names";
import { Icon, isIconName, type IconName } from "@/core/ui/icon";

const FALLBACK_ICONS: IconName[] = [
  "hard-hat",
  "clipboard",
  "chart",
  "car",
  "total-station",
  "gps",
  "desktop",
  "printer",
  "copy",
  "jeep",
  "fingerprint",
  "drone",
  "blueprint",
  "layers",
  "cog",
  "building",
  "buildings",
  "compass",
  "target",
  "users",
  "globe",
  "shield-check",
];

export function iconLabelKey(name: string): string {
  return name.replace(/-/g, "_");
}

export function IconPicker({
  value,
  icons,
  onChange,
}: {
  value: string;
  icons?: string[];
  onChange: (next: string) => void;
}) {
  const t = useTranslations("Dashboard.services");
  const options = (icons?.length ? icons : FALLBACK_ICONS).filter(isIconName);

  function labelFor(name: IconName): string {
    const key = iconLabelKey(name);
    return t.has(`icons.${key}` as "icons.hard_hat") ? t(`icons.${key}` as "icons.hard_hat") : name;
  }

  return (
    <div>
      <p className="mb-2 text-label-s text-secondary">{t("icon")}</p>
      {value && isIconName(value) ? (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-line bg-highlight px-3 py-2">
          <span className="grid size-10 place-items-center rounded-lg bg-elevated text-accent">
            <Icon name={value} />
          </span>
          <span className="text-body-s font-medium">{labelFor(value)}</span>
        </div>
      ) : null}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5" data-icon-picker role="listbox" aria-label={t("icon")}>
        {options.map((name) => {
          const selected = value === name;
          return (
            <button
              aria-selected={selected}
              className={classNames(
                "flex flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition-colors",
                selected ? "border-accent bg-accent/10 text-accent" : "border-line bg-elevated text-secondary hover:bg-highlight",
              )}
              key={name}
              onClick={() => onChange(name)}
              role="option"
              type="button"
            >
              <Icon name={name} />
              <span className="line-clamp-2 text-caption leading-4">{labelFor(name)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
