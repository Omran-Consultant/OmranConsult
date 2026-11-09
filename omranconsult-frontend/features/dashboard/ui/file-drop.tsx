"use client";

import { useRef, type ReactNode } from "react";

import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";

export function FileDrop({
  label,
  hint,
  buttonLabel,
  onFiles,
  accept,
}: {
  label: string;
  hint?: string;
  buttonLabel?: string;
  onFiles?: (files: FileList) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const action = buttonLabel ?? label;

  return (
    <div
      className={classNames(
        "flex min-h-40 flex-col items-center justify-center gap-2 rounded-[1.125rem] border border-dashed border-line bg-elevated p-6 text-center",
      )}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (onFiles && event.dataTransfer.files.length > 0) {
          onFiles(event.dataTransfer.files);
        }
      }}
      role="group"
    >
      <Icon name="upload" />
      <p className="text-label-m">{label}</p>
      {hint ? <p className="text-caption text-muted">{hint}</p> : null}
      <button className="text-label-s text-accent underline" onClick={() => inputRef.current?.click()} type="button">
        {action}
      </button>
      <input
        accept={accept}
        aria-label={action}
        className="sr-only"
        multiple
        onChange={(event) => {
          if (onFiles && event.target.files) {
            onFiles(event.target.files);
          }
        }}
        ref={inputRef}
        type="file"
      />
    </div>
  );
}

export function FileDropNote({ children }: { children: ReactNode }) {
  return <p className="text-caption text-muted">{children}</p>;
}
