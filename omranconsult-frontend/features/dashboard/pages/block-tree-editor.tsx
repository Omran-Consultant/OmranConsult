"use client";

import { useTranslations } from "next-intl";

import { Icon, isIconName } from "@/core/ui/icon";
import { fieldLabel, itemLabel } from "@/features/dashboard/pages/field-labels";
import {
  blankLike,
  isRecord,
  isTranslationMap,
  moveItem,
  type EditorLocale,
  type PayloadNode,
  type PayloadPath,
  type TranslationMap,
} from "@/features/dashboard/pages/payload-tree";
import { IconPicker } from "@/features/dashboard/services/icon-picker";
import { DashboardButton } from "@/features/dashboard/ui/dashboard-button";
import { DashboardTextField, DashboardTextarea } from "@/features/dashboard/ui/dashboard-field";
import { RowActionButton } from "@/features/dashboard/ui/row-action-button";
import type { AppLocale } from "@/i18n/routing";

/** The API caps a list at 40 items (BlockPayloadShape::MAX_ITEMS). */
const MAX_ITEMS = 40;

export type TreeContext = {
  /** Dashboard language, for the field names. */
  readonly locale: AppLocale;
  /** Language tab being edited. Both languages stay mounted so one save carries both. */
  readonly lang: EditorLocale;
  readonly icons: string[];
  /** Path patterns (list indexes as `*`) whose loaded text was long: those fields are textareas. */
  readonly longPatterns: ReadonlySet<string>;
  readonly readOnly: boolean;
  readonly onChange: (path: PayloadPath, value: PayloadNode) => void;
};

export function pathPattern(path: PayloadPath): string {
  return path.map((part) => (typeof part === "number" ? "*" : part)).join(".");
}

function fieldId(path: PayloadPath, suffix?: string): string {
  return ["block", ...path, ...(suffix ? [suffix] : [])].join("-");
}

function TextNode({ node, path, label, ctx }: { node: TranslationMap; path: PayloadPath; label: string; ctx: TreeContext }) {
  const long = ctx.longPatterns.has(pathPattern(path));

  return (
    <div className="min-w-0 flex-1">
      {(["ar", "en"] as const).map((lang) => {
        const shared = {
          dir: "auto" as const,
          disabled: ctx.readOnly,
          id: fieldId(path, lang),
          label,
          lang,
          value: node[lang] ?? "",
        };
        return (
          <div className={lang === ctx.lang ? undefined : "hidden"} key={lang}>
            {long ? (
              <DashboardTextarea {...shared} onChange={(event) => ctx.onChange([...path, lang], event.target.value)} rows={4} />
            ) : (
              <DashboardTextField {...shared} onChange={(event) => ctx.onChange([...path, lang], event.target.value)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ItemActions({ index, total, path, items, ctx }: { index: number; total: number; path: PayloadPath; items: PayloadNode[]; ctx: TreeContext }) {
  const t = useTranslations("Dashboard.pages");
  if (ctx.readOnly) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <RowActionButton disabled={index === 0} label={t("moveUp")} onClick={() => ctx.onChange(path, moveItem(items, index, index - 1))}>
        <Icon className="rotate-90" name="chevron-left" />
      </RowActionButton>
      <RowActionButton disabled={index === total - 1} label={t("moveDown")} onClick={() => ctx.onChange(path, moveItem(items, index, index + 1))}>
        <Icon className="-rotate-90" name="chevron-left" />
      </RowActionButton>
      <RowActionButton
        disabled={total <= 1}
        label={t("removeItem")}
        onClick={() => ctx.onChange(path, items.filter((_, position) => position !== index))}
      >
        <Icon name="trash" />
      </RowActionButton>
    </div>
  );
}

function ListNode({ items, path, label, ctx }: { items: PayloadNode[]; path: PayloadPath; label: string; ctx: TreeContext }) {
  const t = useTranslations("Dashboard.pages");
  const template = items[0];

  return (
    <fieldset className="min-w-0 space-y-3 rounded-xl border border-line p-4" data-block-list={pathPattern(path)}>
      <legend className="px-2 text-label-s text-secondary">{label}</legend>
      <ol className="space-y-3">
        {items.map((item, index) => {
          const itemPath = [...path, index];
          const name = itemLabel(index, ctx.locale);
          return (
            // The inputs are fully controlled by the payload, so a position key is safe when items move.
            <li className="min-w-0" data-block-item="" key={index}>
              {isTranslationMap(item) ? (
                <div className="flex min-w-0 items-end gap-2">
                  <TextNode ctx={ctx} label={name} node={item} path={itemPath} />
                  <ItemActions ctx={ctx} index={index} items={items} path={path} total={items.length} />
                </div>
              ) : (
                <div className="min-w-0 space-y-4 rounded-xl border border-line bg-highlight/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-label-s text-primary">{name}</p>
                    <ItemActions ctx={ctx} index={index} items={items} path={path} total={items.length} />
                  </div>
                  <TreeChildren ctx={ctx} node={item} path={itemPath} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {!ctx.readOnly && template !== undefined && items.length < MAX_ITEMS ? (
        <DashboardButton icon={<Icon name="plus" />} onClick={() => ctx.onChange(path, [...items, blankLike(template)])} variant="secondary">
          {t("addItem")}
        </DashboardButton>
      ) : null}
    </fieldset>
  );
}

function ScalarNode({ value, path, fieldKey, ctx }: { value: string; path: PayloadPath; fieldKey: string; ctx: TreeContext }) {
  if (fieldKey === "icon") {
    if (ctx.readOnly) {
      return null;
    }
    // Collapsed by default: a list of cards would otherwise repeat the whole icon grid per card.
    return (
      <details className="rounded-xl border border-line p-3" data-block-icon="">
        <summary className="flex cursor-pointer items-center gap-2 text-label-s text-secondary">
          {isIconName(value) ? <Icon className="text-accent" name={value} /> : null}
          {fieldLabel(fieldKey, ctx.locale)}
        </summary>
        <div className="mt-3">
          <IconPicker icons={ctx.icons} onChange={(next) => ctx.onChange(path, next)} value={value} />
        </div>
      </details>
    );
  }

  return (
    <DashboardTextField
      dir="ltr"
      disabled={ctx.readOnly}
      id={fieldId(path)}
      label={fieldLabel(fieldKey, ctx.locale)}
      onChange={(event) => ctx.onChange(path, event.target.value)}
      spellCheck={false}
      value={value}
    />
  );
}

function TreeNode({ node, path, fieldKey, ctx }: { node: PayloadNode; path: PayloadPath; fieldKey: string; ctx: TreeContext }) {
  const label = fieldLabel(fieldKey, ctx.locale);

  if (isTranslationMap(node)) {
    return <TextNode ctx={ctx} label={label} node={node} path={path} />;
  }
  if (Array.isArray(node)) {
    return <ListNode ctx={ctx} items={node} label={label} path={path} />;
  }
  if (isRecord(node)) {
    return (
      <fieldset className="min-w-0 space-y-4 rounded-xl border border-line p-4" data-block-group={fieldKey}>
        <legend className="px-2 text-label-s text-secondary">{label}</legend>
        <TreeChildren ctx={ctx} node={node} path={path} />
      </fieldset>
    );
  }
  if (typeof node === "string") {
    return <ScalarNode ctx={ctx} fieldKey={fieldKey} path={path} value={node} />;
  }
  return null;
}

/** The fields of one map: short text first, then nested groups and lists, in the stored order within each. */
export function TreeChildren({ node, path, ctx }: { node: PayloadNode; path: PayloadPath; ctx: TreeContext }) {
  if (!isRecord(node)) {
    return null;
  }
  const entries = Object.entries(node);
  const leaves = entries.filter(([, child]) => isTranslationMap(child) || typeof child === "string");
  const groups = entries.filter(([, child]) => !isTranslationMap(child) && typeof child !== "string");

  return (
    <>
      {[...leaves, ...groups].map(([key, child]) => (
        <TreeNode ctx={ctx} fieldKey={key} key={key} node={child} path={[...path, key]} />
      ))}
    </>
  );
}
