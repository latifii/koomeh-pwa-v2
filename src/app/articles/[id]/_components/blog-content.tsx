import { Lightbulb, Quote } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import type { BlogBlock } from "@/data/blog";

/**
 * Renders the structured article body. Working from a block model (instead of
 * raw HTML) lets every element pick up the site's typography and stay theme- and
 * RTL-aware, with no `dangerouslySetInnerHTML`.
 */
export function BlogContent({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <Typography
          variant="h3"
          as="h2"
          className="mt-2 scroll-mt-24 text-lg sm:text-xl"
        >
          {block.text}
        </Typography>
      );

    case "paragraph":
      return (
        <Typography variant="body" className="leading-8 text-foreground/90">
          {block.text}
        </Typography>
      );

    case "list":
      return block.ordered ? (
        <ol className="grid gap-2">
          {block.items.map((item, index) => (
            <ListItem key={index} index={index + 1}>
              {item}
            </ListItem>
          ))}
        </ol>
      ) : (
        <ul className="grid gap-2">
          {block.items.map((item, index) => (
            <ListItem key={index}>{item}</ListItem>
          ))}
        </ul>
      );

    case "quote":
      return (
        <figure className="relative overflow-hidden rounded-2xl border-s-2 border-brand bg-muted/50 p-4 sm:p-5">
          <Quote className="absolute -top-1 inset-e-3 size-10 text-brand/10" />
          <Typography
            as="blockquote"
            variant="body"
            className="relative font-heading text-base leading-8"
          >
            {block.text}
          </Typography>
          {block.cite && (
            <Typography
              as="figcaption"
              variant="small"
              className="relative mt-2 font-medium text-brand"
            >
              — {block.cite}
            </Typography>
          )}
        </figure>
      );

    case "callout":
      return (
        <aside className="flex gap-3 rounded-2xl border border-brand/20 bg-brand/5 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <Lightbulb className="size-4.5" />
          </span>
          <div>
            <Typography variant="h4" as="p" className="sm:text-sm">
              {block.title}
            </Typography>
            <Typography variant="small" className="mt-1 leading-6">
              {block.text}
            </Typography>
          </div>
        </aside>
      );

    default:
      return null;
  }
}

function ListItem({
  index,
  children,
}: {
  index?: number;
  children: React.ReactNode;
}) {
  return (
    <Typography
      as="li"
      variant="body"
      className="flex items-start gap-2.5 leading-7 text-foreground/90"
    >
      <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-md bg-brand/10 font-heading text-[11px] font-bold text-brand">
        {index ? index.toLocaleString("fa-IR") : "•"}
      </span>
      {children}
    </Typography>
  );
}
