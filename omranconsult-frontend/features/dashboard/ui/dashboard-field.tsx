import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

import { classNames } from "@/core/ui/class-names";
import { controlLgClass } from "@/features/dashboard/ui/control-styles";

type FrameProps = {
  id: string;
  label: string;
  requiredMark?: boolean;
  helper?: string;
  error?: string;
  children: ReactNode;
};

function FieldFrame({ id, label, requiredMark, helper, error, children }: FrameProps) {
  const message = error ?? helper;
  return (
    <div className="flex flex-col gap-2">
      <label className="text-label-s text-secondary" htmlFor={id}>
        {label}
        {requiredMark ? <span aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {message ? (
        <p className={classNames("text-caption", error ? "text-danger" : "text-muted")} id={`${id}-message`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function DashboardTextField(props: InputHTMLAttributes<HTMLInputElement> & { label: string; helper?: string; error?: string }) {
  const { id = "", label, helper, error, className, required, ...rest } = props;
  return (
    <FieldFrame error={error} helper={helper} id={id} label={label} requiredMark={required}>
      <input
        aria-describedby={helper || error ? `${id}-message` : undefined}
        aria-invalid={error ? true : undefined}
        className={classNames(controlLgClass, error ? "border-danger" : undefined, className)}
        id={id}
        required={required}
        {...rest}
      />
    </FieldFrame>
  );
}

export function DashboardTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; helper?: string; error?: string },
) {
  const { id = "", label, helper, error, className, required, rows = 4, ...rest } = props;
  return (
    <FieldFrame error={error} helper={helper} id={id} label={label} requiredMark={required}>
      <textarea
        className={classNames(controlLgClass, "h-auto min-h-[6rem] py-3", error ? "border-danger" : undefined, className)}
        id={id}
        required={required}
        rows={rows}
        {...rest}
      />
    </FieldFrame>
  );
}

export function DashboardSelect(
  props: SelectHTMLAttributes<HTMLSelectElement> & { label: string; helper?: string; error?: string; children: ReactNode },
) {
  const { id = "", label, helper, error, className, required, children, ...rest } = props;
  return (
    <FieldFrame error={error} helper={helper} id={id} label={label} requiredMark={required}>
      <select
        className={classNames(controlLgClass, error ? "border-danger" : undefined, className)}
        id={id}
        required={required}
        {...rest}
      >
        {children}
      </select>
    </FieldFrame>
  );
}

export function DashboardSwitch({
  id,
  label,
  checked,
  onChange,
  description,
  disabled,
  disabledReason,
  compact,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={classNames(
        "flex items-center justify-between gap-3",
        compact ? undefined : "rounded-[var(--control-radius)] border border-line bg-elevated px-4 py-3",
      )}
    >
      <span>
        <label className="block text-label-s text-primary" htmlFor={id}>
          {label}
        </label>
        {description ? <span className="text-caption text-muted">{description}</span> : null}
      </span>
      <button
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        className={classNames(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-accent-strong" : "bg-highlight",
          disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        )}
        disabled={disabled}
        id={id}
        onClick={() => onChange(!checked)}
        role="switch"
        title={disabledReason}
        type="button"
      >
        <span
          className={classNames(
            "absolute top-0.5 size-5 rounded-full bg-white transition-[inset-inline-start]",
            checked ? "start-5" : "start-0.5",
          )}
        />
      </button>
    </div>
  );
}
