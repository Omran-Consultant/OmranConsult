"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";

import {
  applyTextEdit,
  emptyParagraph,
  isAllowedHref,
  plainText,
  setLink,
  toggleMark,
  type ContentBlock,
  type InlineNode,
} from "@/core/content/blocks";
import { classNames } from "@/core/ui/class-names";
import { Icon } from "@/core/ui/icon";
import { controlLgClass, controlMdClass } from "@/features/dashboard/ui/control-styles";

const TOOL_BUTTON =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-transparent text-label-s text-secondary transition-colors hover:border-line hover:bg-highlight focus-visible:border-accent focus-visible:ring-3 focus-visible:ring-accent/20 focus-visible:outline-none data-[active=true]:border-accent data-[active=true]:bg-tint data-[active=true]:text-accent";

export function BlockEditor({
  blocks,
  fieldId,
  onChange,
  allowImages = false,
  onPickImage,
}: {
  blocks: readonly ContentBlock[];
  fieldId?: string;
  onChange: (next: ContentBlock[]) => void;
  allowImages?: boolean;
  onPickImage?: () => void;
}) {
  const t = useTranslations("Dashboard.blocks");
  const visible = blocks.length > 0 ? blocks : [emptyParagraph()];
  const [focusIndex, setFocusIndex] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLinkValue] = useState("");

  function update(index: number, block: ContentBlock) {
    onChange(visible.map((item, itemIndex) => (itemIndex === index ? block : item)));
  }

  function replaceAt(index: number, next: ContentBlock) {
    update(index, next);
  }

  function add(block: ContentBlock) {
    onChange([...visible, block]);
    setFocusIndex(visible.length);
  }

  function remove(index: number) {
    const next = visible.filter((_, itemIndex) => itemIndex !== index);
    onChange(next.length > 0 ? next : [emptyParagraph()]);
    setFocusIndex(Math.max(0, index - 1));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= visible.length) {
      return;
    }
    const next = [...visible];
    const current = next[index];
    const other = next[target];
    if (!current || !other) {
      return;
    }
    next[index] = other;
    next[target] = current;
    onChange(next);
    setFocusIndex(target);
  }

  function focusedChildren(): readonly InlineNode[] | null {
    const block = visible[focusIndex];
    if (!block || block.type === "list" || block.type === "image") {
      return null;
    }
    return block.children;
  }

  function applyMark(mark: "bold" | "italic") {
    const children = focusedChildren();
    const block = visible[focusIndex];
    if (!children || !block || block.type === "list" || block.type === "image") {
      return;
    }
    replaceAt(focusIndex, { ...block, children: toggleMark(children, selection.start, selection.end, mark) });
  }

  function applyLinkHref() {
    const children = focusedChildren();
    const block = visible[focusIndex];
    if (!children || !block || block.type === "list" || block.type === "image" || !isAllowedHref(link)) {
      setLinkOpen(false);
      return;
    }
    replaceAt(focusIndex, { ...block, children: setLink(children, selection.start, selection.end, link) });
    setLinkOpen(false);
    setLinkValue("");
  }

  function turnInto(kind: "paragraph" | "heading-h2" | "heading-h3" | "list-bullet" | "list-number" | "quote") {
    const block = visible[focusIndex] ?? emptyParagraph();
    const text =
      block.type === "list"
        ? plainText(block.items[0] ?? [{ text: "" }])
        : block.type === "image"
          ? ""
          : plainText(block.children);
    if (kind === "paragraph") {
      replaceAt(focusIndex, { type: "paragraph", children: [{ text }] });
      return;
    }
    if (kind === "heading-h2" || kind === "heading-h3") {
      replaceAt(focusIndex, { type: "heading", level: kind === "heading-h2" ? "h2" : "h3", children: [{ text }] });
      return;
    }
    if (kind === "quote") {
      replaceAt(focusIndex, { type: "quote", children: [{ text }] });
      return;
    }
    replaceAt(focusIndex, {
      type: "list",
      style: kind === "list-number" ? "number" : "bullet",
      items: [[ { text } ]],
    });
  }

  const active = visible[focusIndex];

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-line bg-base p-1.5" role="toolbar" aria-label={t("toolbar")}>
        <ToolbarIcon active={false} label={t("bold")} onClick={() => applyMark("bold")} symbol="B" weight />
        <ToolbarIcon active={false} label={t("italic")} onClick={() => applyMark("italic")} symbol="I" italic />
        <ToolbarIcon active={linkOpen} label={t("link")} onClick={() => setLinkOpen((open) => !open)}>
          <Icon name="link" />
        </ToolbarIcon>
        <span aria-hidden className="mx-1 h-5 w-px bg-line" />
        <ToolbarIcon
          active={active?.type === "heading" && active.level === "h2"}
          label={t("h2")}
          onClick={() => turnInto("heading-h2")}
          symbol="H2"
        />
        <ToolbarIcon
          active={active?.type === "heading" && active.level === "h3"}
          label={t("h3")}
          onClick={() => turnInto("heading-h3")}
          symbol="H3"
        />
        <ToolbarIcon
          active={active?.type === "list" && active.style === "bullet"}
          label={t("bullet")}
          onClick={() => turnInto("list-bullet")}
        >
          <Icon name="list" />
        </ToolbarIcon>
        <ToolbarIcon
          active={active?.type === "list" && active.style === "number"}
          label={t("number")}
          onClick={() => turnInto("list-number")}
          symbol="1."
        />
        <ToolbarIcon active={active?.type === "quote"} label={t("quote")} onClick={() => turnInto("quote")}>
          <Icon name="quote" />
        </ToolbarIcon>
        {allowImages ? (
          <ToolbarIcon
            active={false}
            label={t("image")}
            onClick={() => {
              if (onPickImage) {
                onPickImage();
                return;
              }
              add({ type: "image", media_id: 0, alt: { ar: "", en: "" } });
            }}
          >
            <Icon name="image" />
          </ToolbarIcon>
        ) : null}
        <span aria-hidden className="mx-1 h-5 w-px bg-line" />
        <ToolbarIcon active={false} label={t("paragraph")} onClick={() => add(emptyParagraph())}>
          <Icon name="plus" />
        </ToolbarIcon>
      </div>

      {linkOpen ? (
        <div className="flex min-w-0 flex-wrap gap-2">
          <input
            aria-label={t("linkUrl")}
            className={`${controlLgClass} min-w-0 flex-1`}
            dir="ltr"
            onChange={(event) => setLinkValue(event.target.value)}
            placeholder="https://"
            value={link}
          />
          <button className={controlMdClass} onClick={applyLinkHref} type="button">
            {t("applyLink")}
          </button>
        </div>
      ) : null}

      {visible.map((block, index) => (
        <section
          className="group relative min-w-0 rounded-xl border border-line p-3 focus-within:border-accent"
          key={`${block.type}-${index}`}
          onFocusCapture={() => setFocusIndex(index)}
        >
          <div className="pointer-events-none absolute end-2 top-2 z-10 flex gap-1 opacity-0 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
            <ToolbarIcon active={false} label={t("moveUp")} onClick={() => move(index, -1)}>
              <Icon name="chevron-down" className="rotate-180" />
            </ToolbarIcon>
            <ToolbarIcon active={false} label={t("moveDown")} onClick={() => move(index, 1)}>
              <Icon name="chevron-down" />
            </ToolbarIcon>
            <ToolbarIcon active={false} label={t("remove")} onClick={() => remove(index)}>
              <Icon name="trash" />
            </ToolbarIcon>
          </div>
          <p className="mb-2 text-caption text-muted">{t(block.type === "image" ? "image" : block.type)}</p>
          {block.type === "list" ? (
            <div className="space-y-3">
              {block.items.map((item, itemIndex) => (
                <InlineField
                  childrenNodes={item}
                  id={index === 0 && itemIndex === 0 ? fieldId : undefined}
                  key={itemIndex}
                  label={t("list")}
                  onChange={(children) =>
                    update(index, {
                      ...block,
                      items: block.items.map((entry, entryIndex) => (entryIndex === itemIndex ? children : entry)),
                    })
                  }
                  onSelectRange={(start, end) => {
                    setFocusIndex(index);
                    setSelection({ start, end });
                  }}
                />
              ))}
              <button
                className={controlMdClass}
                onClick={() => update(index, { ...block, items: [...block.items, [{ text: "" }]] })}
                type="button"
              >
                {t("addItem")}
              </button>
            </div>
          ) : block.type === "image" ? (
            <div className="space-y-2 text-caption text-muted">
              <p>{t("imageHint")}</p>
              <p dir="ltr">media_id: {block.media_id || "—"}</p>
            </div>
          ) : (
            <InlineField
              childrenNodes={block.children}
              id={index === 0 ? fieldId : undefined}
              label={t(block.type)}
              onChange={(children) => update(index, { ...block, children })}
              onSelectRange={(start, end) => {
                setFocusIndex(index);
                setSelection({ start, end });
              }}
            />
          )}
        </section>
      ))}
    </div>
  );
}

function ToolbarIcon({
  label,
  onClick,
  active,
  symbol,
  weight,
  italic,
  children,
}: {
  label: string;
  onClick: () => void;
  active: boolean;
  symbol?: string;
  weight?: boolean;
  italic?: boolean;
  children?: ReactNode;
}) {
  const accessibleName = symbol ? `${symbol} ${label}` : label;

  return (
    <button
      aria-label={accessibleName}
      className={TOOL_BUTTON}
      data-active={active ? "true" : "false"}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children ?? (
        <span className={classNames(weight ? "font-bold" : undefined, italic ? "italic" : undefined)}>{symbol}</span>
      )}
    </button>
  );
}

function InlineField({
  id,
  label,
  childrenNodes,
  onChange,
  onSelectRange,
}: {
  id?: string;
  label: string;
  childrenNodes: readonly InlineNode[];
  onChange: (next: InlineNode[]) => void;
  onSelectRange: (start: number, end: number) => void;
}) {
  return (
    <textarea
      aria-label={label}
      className={`${controlLgClass} h-auto min-h-24 py-3`}
      id={id}
      onChange={(event) => onChange(applyTextEdit(childrenNodes, event.target.value))}
      onSelect={(event) => onSelectRange(event.currentTarget.selectionStart ?? 0, event.currentTarget.selectionEnd ?? 0)}
      value={plainText(childrenNodes)}
    />
  );
}
