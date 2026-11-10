"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { controlLgClass } from "@/features/dashboard/ui/control-styles";

export type MultiSelectOption = {
  readonly id: number;
  readonly label: string;
};

export function DashboardMultiSelect({
  id,
  label,
  options,
  values,
  onChange,
  searchPlaceholder,
  emptyLabel,
  selectedLabel,
}: {
  id: string;
  label: string;
  options: readonly MultiSelectOption[];
  values: readonly number[];
  onChange: (next: number[]) => void;
  searchPlaceholder: string;
  emptyLabel: string;
  selectedLabel: (count: number) => string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointer(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = useMemo(
    () => options.filter((option) => values.includes(option.id)),
    [options, values],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) {
      return options;
    }
    return options.filter((option) => option.label.toLocaleLowerCase().includes(needle));
  }, [options, query]);

  function toggle(optionId: number) {
    onChange(values.includes(optionId) ? values.filter((value) => value !== optionId) : [...values, optionId]);
  }

  return (
    <div className="flex min-w-0 flex-col gap-2" ref={rootRef}>
      <label className="text-label-s text-secondary" htmlFor={id}>
        {label}
      </label>
      <button
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={classNames(controlLgClass, "flex items-center justify-between gap-2 text-start")}
        id={id}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="min-w-0 truncate">{values.length === 0 ? emptyLabel : selectedLabel(values.length)}</span>
        <Icon className="shrink-0 text-muted" name="chevron-down" />
      </button>
      {selected.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {selected.map((option) => (
            <li key={option.id}>
              <button
                className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-elevated px-3 text-caption text-primary"
                onClick={() => toggle(option.id)}
                type="button"
              >
                <span>{option.label}</span>
                <Icon name="close" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {open ? (
        <div className="rounded-xl border border-line bg-elevated p-2 shadow-[var(--elevation-popup)]" id={listId} role="listbox">
          <input
            aria-label={searchPlaceholder}
            autoFocus
            className={classNames(controlLgClass, "mb-2")}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            type="search"
            value={query}
          />
          <ul className="max-h-64 space-y-1 overflow-y-auto">
            {filtered.map((option) => {
              const checked = values.includes(option.id);
              return (
                <li key={option.id}>
                  <label
                    className={classNames(
                      "flex h-12 cursor-pointer items-center gap-3 rounded-lg px-3 text-body-s",
                      checked ? "bg-tint text-accent" : "hover:bg-highlight",
                    )}
                  >
                    <input
                      checked={checked}
                      className="size-4 shrink-0 appearance-none rounded border border-line bg-elevated checked:border-accent checked:bg-accent dark:bg-transparent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent/20"
                      onChange={() => toggle(option.id)}
                      type="checkbox"
                    />
                    <span className="min-w-0 truncate">{option.label}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
