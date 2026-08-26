export type BlogSort = 1 | 2 | 3;

export type BlogSearchParams = {
  category_id?: number;
  q?: string;
  sort?: BlogSort;
  page?: number;
  per_page?: number;
};

export type BlogRequestOptions = {
  signal?: AbortSignal;
};

export type BlogCategory = {
  id: number;
  name: string;
  postCount: number;
  isArea: boolean;
};

export type BlogArticleCard = {
  id: string;
  numericId: number;
  title: string;
  excerpt: string;
  image?: string;
  category?: { id: number; name: string };
  views: number;
  publishedAtLabel: string;
  createdAt: string;
  href: string;
};

export type BlogTag = {
  id: number;
  name: string;
};

export type BlogSeo = {
  title?: string;
  description?: string;
  canonical?: string;
};

export type BlogArticleDetail = BlogArticleCard & {
  body?: string;
  isArea: boolean;
  seo: BlogSeo;
  tags: BlogTag[];
  related: BlogArticleCard[];
};
