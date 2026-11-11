"use client";

import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";

import { clearAccentMarkers, parseAccentText } from "@/core/text/accent-text";
import { classNames } from "@/core/ui/class-names";
import { controlLgClass } from "@/features/dashboard/ui/control-styles";

type AccentTextFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly lang: "ar" | "en";
  readonly disabled?: boolean;
  readonly long?: boolean;
  readonly onChange: (value: string) => void;
};

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Render stored `{accent}` markers as green spans; markers never appear as text. */
function valueToHtml(value: string): string {
  if (!value) {
    return "";
  }
  const lines = value.includes("{accent}") || value.includes("\n") ? parseAccentText(value) : null;
  if (!lines) {
    return escapeHtml(value);
  }
  if (lines.length === 0) {
    return "";
  }
  return lines
    .map((line) =>
      line
        .map((segment) => {
          const safe = escapeHtml(segment.text);
          return segment.accent ? `<span data-accent="">${safe}</span>` : safe;
        })
        .join(""),
    )
    .join("<br>");
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }
  const element = node as HTMLElement;
  if (element.tagName === "BR") {
    return "\n";
  }
  const inner = Array.from(element.childNodes).map(serializeNode).join("");
  if (element.hasAttribute("data-accent")) {
    return `{accent}${inner}{/accent}`;
  }
  return inner;
}

function htmlRootToValue(root: HTMLElement): string {
  return Array.from(root.childNodes).map(serializeNode).join("");
}

/**
 * Text field that stores `{accent}…{/accent}` but never shows those tokens.
 * Select a word, then use «تمييز» to mark it green (same storage format as the public site).
 */
export function AccentTextField({ id, label, value, lang, disabled = false, long = false, onChange }: AccentTextFieldProps) {
  const t = useTranslations("Dashboard.pages");
  const editorRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const html = valueToHtml(value);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) {
      return;
    }
    if (editor.innerHTML !== html) {
      editor.innerHTML = html || "";
    }
  }, [html]);

  function commitFromEditor() {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }
    onChange(htmlRootToValue(editor));
  }

  function highlightSelection() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || disabled || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
      return;
    }
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      return;
    }
    const selectedText = range.toString();
    if (!selectedText.trim()) {
      return;
    }
    range.deleteContents();
    const span = document.createElement("span");
    span.setAttribute("data-accent", "");
    span.textContent = selectedText;
    range.insertNode(span);
    selection.removeAllRanges();
    onChange(htmlRootToValue(editor));
  }

  function clearHighlight() {
    if (disabled) {
      return;
    }
    const editor = editorRef.current;
    const current = editor ? htmlRootToValue(editor) : value;
    onChange(clearAccentMarkers(current));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" && !long) {
      event.preventDefault();
    }
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="text-label-s text-secondary" htmlFor={id}>
          {label}
        </label>
        {!disabled ? (
          <div className="flex items-center gap-2">
            <button
              className="h-9 rounded-[var(--control-radius)] border border-line bg-elevated px-3 text-label-s text-primary hover:bg-highlight"
              data-accent-highlight=""
              onClick={highlightSelection}
              type="button"
            >
              {t("highlightWord")}
            </button>
            <button
              className="h-9 rounded-[var(--control-radius)] border border-line bg-elevated px-3 text-label-s text-secondary hover:bg-highlight"
              onClick={clearHighlight}
              type="button"
            >
              {t("clearHighlight")}
            </button>
          </div>
        ) : null}
      </div>
      <div
        aria-describedby={hintId}
        aria-disabled={disabled || undefined}
        aria-multiline={long || undefined}
        className={classNames(
          controlLgClass,
          "block w-full whitespace-pre-wrap text-start [&_[data-accent]]:font-medium [&_[data-accent]]:text-accent",
          long ? "h-auto min-h-[6rem] py-3" : "flex items-center overflow-hidden py-0",
          disabled ? "cursor-not-allowed opacity-60" : undefined,
        )}
        contentEditable={!disabled}
        data-accent-editor=""
        dir="auto"
        id={id}
        lang={lang}
        onBlur={commitFromEditor}
        onInput={commitFromEditor}
        onKeyDown={onKeyDown}
        ref={editorRef}
        role="textbox"
        suppressContentEditableWarning
      />
      <p className="mt-2 text-caption text-muted" id={hintId}>
        {t("highlightHint")}
      </p>
    </div>
  );
}
