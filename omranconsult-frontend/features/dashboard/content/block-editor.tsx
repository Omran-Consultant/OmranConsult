"use client";

import { useState } from "react";
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
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { controlLgClass, controlMdClass } from "@/features/dashboard/ui/control-styles";

export function BlockEditor({
  blocks,
  fieldId,
  onChange,
}: {
  blocks: readonly ContentBlock[];
  fieldId?: string;
  onChange: (next: ContentBlock[]) => void;
}) {
  const t = useTranslations("Dashboard.blocks");
  const visible = blocks.length > 0 ? blocks : [emptyParagraph()];

  function update(index: number, block: ContentBlock) {
    onChange(visible.map((item, itemIndex) => (itemIndex === index ? block : item)));
  }

  function add(block: ContentBlock) {
    onChange([...visible, block]);
  }

  function remove(index: number) {
    const next = visible.filter((_, itemIndex) => itemIndex !== index);
    onChange(next.length > 0 ? next : [emptyParagraph()]);
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
  }

  return (
    <div className="space-y-4">
      {visible.map((block, index) => (
        <section className="rounded-xl border border-line p-3" key={`${block.type}-${index}`}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-caption text-muted">{t(block.type)}</span>
            {block.type === "heading" ? (
              <select
                aria-label={t("heading")}
                className={`${controlMdClass} w-28`}
                onChange={(event) => update(index, { ...block, level: event.target.value === "h3" ? "h3" : "h2" })}
                value={block.level}
              >
                <option value="h2">{t("h2")}</option>
                <option value="h3">{t("h3")}</option>
              </select>
            ) : null}
            {block.type === "list" ? (
              <select
                aria-label={t("list")}
                className={`${controlMdClass} w-32`}
                onChange={(event) => update(index, { ...block, style: event.target.value === "number" ? "number" : "bullet" })}
                value={block.style}
              >
                <option value="bullet">{t("bullet")}</option>
                <option value="number">{t("number")}</option>
              </select>
            ) : null}
            <DashboardButton onClick={() => move(index, -1)} type="button" variant="ghost">
              {t("moveUp")}
            </DashboardButton>
            <DashboardButton onClick={() => move(index, 1)} type="button" variant="ghost">
              {t("moveDown")}
            </DashboardButton>
            <DashboardButton onClick={() => remove(index)} type="button" variant="ghost">
              {t("remove")}
            </DashboardButton>
          </div>
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
                />
              ))}
              <DashboardButton onClick={() => update(index, { ...block, items: [...block.items, [{ text: "" }]] })} type="button" variant="secondary">
                {t("addItem")}
              </DashboardButton>
            </div>
          ) : (
            <InlineField
              childrenNodes={block.children}
              id={index === 0 ? fieldId : undefined}
              label={t(block.type)}
              onChange={(children) => update(index, { ...block, children })}
            />
          )}
        </section>
      ))}
      <div className="flex flex-wrap gap-2">
        <DashboardButton onClick={() => add(emptyParagraph())} type="button" variant="secondary">
          {t("paragraph")}
        </DashboardButton>
        <DashboardButton onClick={() => add({ type: "heading", level: "h2", children: [{ text: "" }] })} type="button" variant="secondary">
          {t("heading")}
        </DashboardButton>
        <DashboardButton onClick={() => add({ type: "list", style: "bullet", items: [[{ text: "" }]] })} type="button" variant="secondary">
          {t("list")}
        </DashboardButton>
        <DashboardButton onClick={() => add({ type: "quote", children: [{ text: "" }] })} type="button" variant="secondary">
          {t("quote")}
        </DashboardButton>
      </div>
    </div>
  );
}

function InlineField({
  id,
  label,
  childrenNodes,
  onChange,
}: {
  id?: string;
  label: string;
  childrenNodes: readonly InlineNode[];
  onChange: (next: InlineNode[]) => void;
}) {
  const t = useTranslations("Dashboard.blocks");
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [link, setLinkValue] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  function rememberSelection(target: HTMLTextAreaElement) {
    setStart(target.selectionStart ?? 0);
    setEnd(target.selectionEnd ?? 0);
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        <button className={controlMdClass} onClick={() => onChange(toggleMark(childrenNodes, start, end, "bold"))} type="button">
          {t("bold")}
        </button>
        <button className={controlMdClass} onClick={() => onChange(toggleMark(childrenNodes, start, end, "italic"))} type="button">
          {t("italic")}
        </button>
        <button className={controlMdClass} onClick={() => setLinkOpen((open) => !open)} type="button">
          {t("link")}
        </button>
      </div>
      {linkOpen ? (
        <div className="mb-2 flex flex-wrap gap-2">
          <input
            aria-label={t("linkUrl")}
            className={`${controlLgClass} max-w-md`}
            onChange={(event) => setLinkValue(event.target.value)}
            placeholder="https://"
            value={link}
          />
          <button
            className={controlMdClass}
            onClick={() => {
              if (isAllowedHref(link)) {
                onChange(setLink(childrenNodes, start, end, link));
              }
              setLinkOpen(false);
            }}
            type="button"
          >
            {t("applyLink")}
          </button>
        </div>
      ) : null}
      <textarea
        aria-label={label}
        className={`${controlLgClass} h-auto min-h-24 py-3`}
        id={id}
        onChange={(event) => onChange(applyTextEdit(childrenNodes, event.target.value))}
        onSelect={(event) => rememberSelection(event.currentTarget)}
        value={plainText(childrenNodes)}
      />
    </div>
  );
}
