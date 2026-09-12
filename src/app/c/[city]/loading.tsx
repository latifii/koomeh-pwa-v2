import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

/**
 * The one public route that is genuinely server-rendered per request, so this
 * is the loading state visitors actually see.
 *
 * The heading deliberately omits the city: it comes from the query string and
 * is not known until the page itself renders. "جستجوی ملک" growing into
 * "جستجوی ملک در قم" reads as the page settling; a grey bar in its place reads
 * as the page reloading.
 */
export default function Loading() {
  return (
    <div className="py-section-sm">
      <Container className="mb-5">
        <Breadcrumb
          inContainer={false}
          className="mb-4"
          items={[
            { label: "خانه", href: routes.home },
            { label: "جستجوی ملک" },
          ]}
        />

        <div className="flex flex-col gap-1">
          <Typography as="h1" variant="h2">
            جستجوی ملک
          </Typography>
          <Typography variant="muted">
            فایل‌های بررسی‌شده خرید و اجاره را با فیلترهای دقیق پیدا کنید.
          </Typography>
        </div>
      </Container>

      <Container>
        <div className="flex flex-col gap-4">
          {/* Stands in for the toolbar, which the real view renders above the
              two-column body. */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-44 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[19rem_1fr] lg:items-start">
            <Skeleton className="hidden h-[32rem] rounded-2xl lg:block" />
            <ListSkeleton
              count={6}
              withFilters={false}
              columns="sm:grid-cols-2 xl:grid-cols-3"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
