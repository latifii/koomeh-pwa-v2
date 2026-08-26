import type { BlogSearchParams } from "@/app/articles/_types/blog.types";

export const blogQueryKeys = {
  all: ["blog"] as const,
  categories: () => [...blogQueryKeys.all, "categories"] as const,
  list: (params: Omit<BlogSearchParams, "page">) =>
    [...blogQueryKeys.all, "list", params] as const,
  detail: (id: string | number) =>
    [...blogQueryKeys.all, "detail", String(id)] as const,
};
