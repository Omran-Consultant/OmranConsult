"use client";

import { useEffect, useId, useState, useTransition, type FormEvent } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { Spinner } from "@/core/ui/spinner";
import { projectsQuery, searchTerm, type ProjectsFilters } from "@/features/projects/services/projects-filters";
import { useRouter } from "@/i18n/navigation";
import { useHydrated } from "@/core/hooks/use-hydrated";

type ProjectsSearchProps = {
  readonly filters: ProjectsFilters;
  readonly label: string;
  readonly placeholder: string;
  readonly className?: string;
};

const DEBOUNCE_MS = 300;

/**
 * Figma search pill. Typing updates `?q=` after 300 ms (page reset to 1); Enter applies at once.
 * Without JavaScript it is a GET form that keeps the other filters.
 */
export function ProjectsSearch({ filters, label, placeholder, className }: ProjectsSearchProps) {
  const router = useRouter();
  const id = useId();
  const [pending, startTransition] = useTransition();
  const hydrated = useHydrated();
  const [value, setValue] = useState(filters.q ?? "");
  const [applied, setApplied] = useState(filters.q);
  const [urlQuery, setUrlQuery] = useState(filters.q);

  // The URL changed from outside the box (for example «مسح الفلاتر»): show the new term.
  if (filters.q !== urlQuery) {
    setUrlQuery(filters.q);
    if (filters.q !== applied) {
      setValue(filters.q ?? "");
      setApplied(filters.q);
    }
  }

  function apply(term: string | undefined) {
    setApplied(term);
    startTransition(() => {
      router.replace(`/projects${projectsQuery(filters, { q: term, page: 1 })}`, { scroll: false });
    });
  }

  useEffect(() => {
    const term = searchTerm(value);
    if (term === applied) {
      return;
    }
    const timer = setTimeout(() => apply(term), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = searchTerm(value);
    if (term !== applied) {
      apply(term);
    }
  }

  return (
    // A plain GET form until hydration (works without JS); the debounced search needs React.
    <form action="" className={classNames("relative", className)} data-hydrated={hydrated ? "" : undefined} onSubmit={onSubmit} role="search">
      {(["sector", "client", "region"] as const).map((key) =>
        filters[key] ? <input key={key} name={key} type="hidden" value={filters[key]} /> : null,
      )}
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-4 flex items-center text-muted">
        {pending ? <Spinner /> : <Icon name="search" />}
      </span>
      <input
        autoComplete="off"
        className="h-11 w-full rounded-full border border-line-strong bg-glass ps-11 pe-4 text-body-s text-primary transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-accent/20 focus:outline-none max-md:bg-surface md:h-12"
        enterKeyHint="search"
        id={id}
        maxLength={100}
        name="q"
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </form>
  );
}
