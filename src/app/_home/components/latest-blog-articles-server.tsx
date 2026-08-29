import { getCachedLatestBlogArticles } from "@/app/_home/_cache/home-content.cache";
import { HOME_CONTENT_LIMITS } from "@/app/_home/_constants/home-limits";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { ContentSectionError } from "./content-section-state";
import { ArticlesSection } from "./articles-section";

/**
 * Fetched and rendered on the server.
 *
 * This used to hand the data to a client component through a
 * `HydrationBoundary`, which meant the browser downloaded the query, the axios
 * client and the whole Zod schema tree for a `queryFn` that never ran: the
 * data was already hydrated, `staleTime` is five minutes and
 * `refetchOnWindowFocus` is off. The section below has no interactivity of its
 * own, so rendering it here keeps it — and everything it imports — out of the
 * client bundle entirely.
 */
export async function LatestBlogArticlesServer() {
  let section;

  try {
    section = await getCachedLatestBlogArticles(HOME_CONTENT_LIMITS.blogArticles);
  } catch (error) {
    return (
      <ContentSectionError
        variant="articles"
        title="دریافت مقالات ناموفق بود"
        message={getApiErrorMessage(error)}
      />
    );
  }

  return <ArticlesSection section={section} />;
}
