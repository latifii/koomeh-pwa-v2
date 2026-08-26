import { toAbsoluteMediaUrl } from "@/lib/api/config";

const blockedTags =
  /<\/?(?:script|style|iframe|object|embed|form|input|button|textarea|select|option|link|meta|base|svg|math)\b[^>]*>/gi;
const eventAttributes = /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const unsafeUrlAttributes =
  /\s+(href|src|xlink:href|action|formaction|poster)\s*=\s*(["']?)\s*(?:javascript:|vbscript:|data:text\/html)[^\s>]*\2/gi;

function prepareBlogHtml(value: string): string {
  const sanitized = value
    .replace(blockedTags, "")
    .replace(eventAttributes, "")
    .replace(/\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(unsafeUrlAttributes, "");

  return sanitized.replace(
    /(<img\b[^>]*?\ssrc\s*=\s*)(["'])([^"']+)\2/gi,
    (match, prefix: string, quote: string, src: string) => {
      const absolute = toAbsoluteMediaUrl(src.trim());
      return absolute ? `${prefix}${quote}${absolute}${quote}` : match;
    },
  );
}

export function BlogContent({ html }: { html: string | null | undefined }) {
  if (!html?.trim()) return null;

  return (
    <div
      className="blog-content grid gap-4 leading-8 text-foreground/90 [&_a]:text-brand [&_a]:underline [&_blockquote]:border-s-2 [&_blockquote]:border-brand [&_blockquote]:bg-muted/50 [&_blockquote]:p-4 [&_h1]:font-heading [&_h1]:font-bold [&_h2]:font-heading [&_h2]:font-bold [&_h3]:font-heading [&_h3]:font-bold [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_li]:my-1 [&_ol]:list-decimal [&_ol]:pe-5 [&_p]:m-0 [&_table]:w-full [&_table]:overflow-x-auto [&_ul]:list-disc [&_ul]:pe-5"
      dangerouslySetInnerHTML={{ __html: prepareBlogHtml(html) }}
    />
  );
}
