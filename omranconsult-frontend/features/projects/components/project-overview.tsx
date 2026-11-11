import type { ContentBlock } from "@/core/content/blocks";
import { InlineRuns } from "@/core/ui/inline-runs";

/** Project overview blocks. A single plain paragraph stays on the section subtitle instead. */
export function ProjectOverview({ blocks }: { readonly blocks: readonly ContentBlock[] }) {
  return (
    <div className="flex max-w-160 min-w-0 flex-col gap-4 wrap-anywhere">
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
        if (block.type === "image") {
          return null;
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
