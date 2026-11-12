"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";

export type ListboxOption = { readonly value: string; readonly label: string };

type ListboxSelectProps = {
  readonly id: string;
  readonly label: string;
  /** Form field name; the value is submitted through a hidden input. */
  readonly name: string;
  readonly options: readonly ListboxOption[];
  readonly defaultValue?: string;
  readonly className?: string;
};

const TYPEAHEAD_RESET_MS = 500;

/**
 * Select-only combobox (WAI-ARIA APG pattern) in the site style. It replaces the native select
 * where the OS dropdown breaks the design. Focus stays on the trigger; the active option is
 * announced through `aria-activedescendant`. The value submits with the surrounding GET form.
 */
export function ListboxSelect({ id, label, name, options, defaultValue = "", className }: ListboxSelectProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", at: 0 });
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options[selectedIndex];
  const optionId = (index: number) => `${id}-option-${index}`;

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
    }
  }, [open, active]);

  function openAt(index: number) {
    setActive(index);
    setOpen(true);
  }

  function choose(index: number) {
    const option = options[index];
    if (option) {
      setValue(option.value);
    }
    setOpen(false);
  }

  function matchTypeahead(key: string): number | undefined {
    const now = performance.now();
    const state = typeahead.current;
    state.text = now - state.at > TYPEAHEAD_RESET_MS ? key : state.text + key;
    state.at = now;
    const query = state.text.toLocaleLowerCase();
    const start = open ? active : selectedIndex;
    const ordered = [...options.keys()].map((offset) => (start + offset + (state.text.length === 1 ? 1 : 0)) % options.length);
    return ordered.find((index) => options[index]?.label.toLocaleLowerCase().startsWith(query));
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1;
    if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const match = matchTypeahead(event.key);
      if (match !== undefined) {
        event.preventDefault();
        openAt(match);
      }
      return;
    }
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openAt(selectedIndex);
      } else if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        openAt(event.key === "Home" ? 0 : last);
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive(Math.min(active + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        if (event.altKey) {
          choose(active);
        } else {
          setActive(Math.max(active - 1, 0));
        }
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(last);
        break;
      case "PageDown":
        event.preventDefault();
        setActive(Math.min(active + 10, last));
        break;
      case "PageUp":
        event.preventDefault();
        setActive(Math.max(active - 10, 0));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        break;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        break;
      case "Tab":
        choose(active);
        break;
    }
  }

  return (
    <div className={classNames("flex flex-col gap-2.5", className)}>
      <label className="text-label-s text-secondary" htmlFor={id} id={`${id}-label`}>
        {label}
      </label>
      <div className="relative" ref={rootRef}>
        <input name={name} type="hidden" value={value} />
        <button
          aria-activedescendant={open ? optionId(active) : undefined}
          aria-controls={listboxId}
          aria-expanded={open}
          aria-haspopup="listbox"
          className={classNames(
            "flex h-11 w-full items-center gap-3 rounded-md border bg-glass ps-4.5 pe-4 text-start text-body-m text-primary transition-[border-color,box-shadow] duration-150 md:h-12",
            "focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 focus-visible:outline-none",
            open ? "border-accent" : "border-line-strong",
          )}
          id={id}
          onClick={() => (open ? setOpen(false) : openAt(selectedIndex))}
          onKeyDown={onKeyDown}
          role="combobox"
          title={selected?.label}
          type="button"
        >
          <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
          <Icon className={classNames("shrink-0 text-muted transition-transform duration-150", open && "rotate-180")} name="chevron-down" />
        </button>
        <ul
          aria-labelledby={`${id}-label`}
          className={classNames(
            "absolute inset-x-0 top-full z-30 mt-2 max-h-80 overflow-y-auto overscroll-contain rounded-lg border border-line bg-elevated p-1.5 shadow-elevated",
            !open && "hidden",
          )}
          id={listboxId}
          ref={listRef}
          role="listbox"
          tabIndex={-1}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <li
                aria-selected={isSelected}
                className={classNames(
                  "flex cursor-pointer items-start gap-3 rounded-md px-3 py-2.5 text-body-m break-words",
                  index === active ? "bg-highlight text-primary" : "text-secondary",
                  isSelected && "font-medium text-primary",
                )}
                id={optionId(index)}
                key={option.value || "__all"}
                onClick={() => choose(index)}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                role="option"
              >
                <span className="min-w-0 flex-1">{option.label}</span>
                <Icon className={classNames("mt-0.5 shrink-0 text-accent", !isSelected && "invisible")} name="check" />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
