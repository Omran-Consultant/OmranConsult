import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

import { classNames } from "@/core/ui/class-names";

const FIELD_CLASS =
  "w-full rounded-md border bg-glass px-[18px] py-4 text-body-m text-primary transition-[border-color,box-shadow] duration-150 placeholder:text-muted focus:border-accent focus:ring-3 focus:ring-accent/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40";

type FieldFrameProps = {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly requiredMark?: boolean;
  readonly error?: string;
  readonly helper?: string;
  readonly className?: string;
  readonly children: ReactNode;
};

/** Label, control and helper/error text (Figma "Input Field": gap 10, Label 13 Medium). */
function FieldFrame({ id, label, requiredMark, error, helper, className, children }: FieldFrameProps) {
  const message = error ?? helper;

  return (
    <div className={classNames("flex flex-col gap-2.5", className)}>
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

function fieldState(error?: string) {
  return error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-line-strong";
}

type InputFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & {
  readonly id: string;
  readonly label: string;
  readonly error?: string;
  readonly helper?: string;
  readonly className?: string;
};

export function InputField({ id, label, error, helper, className, required, ...rest }: InputFieldProps) {
  return (
    <FieldFrame className={className} error={error} helper={helper} id={id} label={label} requiredMark={required}>
      <input
        aria-describedby={error || helper ? `${id}-message` : undefined}
        aria-invalid={error ? true : undefined}
        className={classNames(FIELD_CLASS, fieldState(error))}
        id={id}
        required={required}
        {...rest}
      />
    </FieldFrame>
  );
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "className"> & {
  readonly id: string;
  readonly label: string;
  readonly error?: string;
  readonly helper?: string;
  readonly className?: string;
};

export function TextAreaField({ id, label, error, helper, className, required, ...rest }: TextAreaFieldProps) {
  return (
    <FieldFrame className={className} error={error} helper={helper} id={id} label={label} requiredMark={required}>
      <textarea
        aria-describedby={error || helper ? `${id}-message` : undefined}
        aria-invalid={error ? true : undefined}
        className={classNames(FIELD_CLASS, "min-h-32 resize-y", fieldState(error))}
        id={id}
        required={required}
        {...rest}
      />
    </FieldFrame>
  );
}
