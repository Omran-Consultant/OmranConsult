import { Fragment, type ReactNode } from "react";

import type { InlineNode } from "@/core/content/blocks";

/** Editor text runs (bold, italic, link) inside a rich-text block. */
export function InlineRuns({ nodes }: { readonly nodes: readonly InlineNode[] }) {
  return nodes.map((node, index) => {
    let content: ReactNode = node.text;
    if (node.bold) {
      content = <strong>{content}</strong>;
    }
    if (node.italic) {
      content = <em>{content}</em>;
    }
    if (node.href) {
      content = (
        <a className="text-accent underline" href={node.href} rel="noopener noreferrer">
          {content}
        </a>
      );
    }
    return <Fragment key={`${node.text}-${index}`}>{content}</Fragment>;
  });
}
