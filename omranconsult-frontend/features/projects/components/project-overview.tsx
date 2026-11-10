import { Fragment, type ReactNode } from "react";

import type { ContentBlock, InlineNode } from "@/core/content/blocks";

function InlineRuns({ nodes }: { readonly nodes: readonly InlineNode[] }) {
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

/** Project overview blocks. A single plain paragraph stays on the section subtitle instead. */
export function ProjectOverview({ blocks }: { readonly blocks: readonly ContentBlock[] }) {
  return (
    <div className="flex max-w-160 flex-col gap-4">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Heading = block.level;
          return (
            <Heading className={block.level === "h2" ? "font-display text-h2 text-primary" : "font-display text-h3 text-primary"} key={index}>
              <InlineRuns nodes={block.children} />
            </Heading>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote className="border-s-4 border-accent ps-4 text-body-l text-secondary" key={index}>
              <InlineRuns nodes={block.children} />
            </blockquote>
          );
        }
        if (block.type === "list") {
          const List = block.style === "number" ? "ol" : "ul";
          return (
            <List className={block.style === "number" ? "list-decimal ps-5 text-body-l text-secondary" : "list-disc ps-5 text-body-l text-secondary"} key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <InlineRuns nodes={item} />
                </li>
              ))}
            </List>
          );
        }
        return (
          <p className="text-body-l text-secondary" key={index}>
            <InlineRuns nodes={block.children} />
          </p>
        );
      })}
    </div>
  );
}
