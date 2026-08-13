import Image from "next/image";
import { PenLine } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { defaultAvatars } from "@/data/avatars";
import type { BlogAuthor } from "@/data/blog";

/** Byline block that closes the article — who wrote it and what they do. */
export function BlogAuthorCard({ author }: { author: BlogAuthor }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
      <Image
        src={defaultAvatars[author.gender]}
        alt={author.name}
        width={48}
        height={48}
        className="size-12 rounded-full object-cover ring-2 ring-secondary/40"
      />
      <div className="min-w-0 flex-1">
        <Typography
          as="span"
          variant="small"
          className="flex items-center gap-1 text-[11px] text-brand"
        >
          <PenLine className="size-3" />
          نویسنده
        </Typography>
        <Typography variant="h4" as="p" className="sm:text-sm">
          {author.name}
        </Typography>
        <Typography variant="small" className="text-[11px]">
          {author.role}
        </Typography>
      </div>
    </div>
  );
}
