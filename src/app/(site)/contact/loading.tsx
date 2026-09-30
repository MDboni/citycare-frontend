import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level loading UI — this page reads the taxonomy before it renders.
 *
 * Written out rather than reusing `ArticlePageSkeleton`: this page opens with a
 * two-column hero and a picture the height of it, and the generic skeleton drew
 * three short lines where that band goes. Holding the wrong shape is worse than
 * holding none — the whole page jumped down the moment the data landed.
 */
export default function Loading() {
  return (
    <div className="pb-16 lg:pb-24" aria-hidden>
      <div className="surface-wash border-b border-border">
        <div className="page-shell grid gap-10 py-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="space-y-6 lg:col-start-2 lg:row-start-1">
            <Skeleton className="h-7 w-44 rounded-4xl" />
            <Skeleton className="h-10 w-4/5" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-9 w-36 rounded-lg" />
              <Skeleton className="h-9 w-36 rounded-lg" />
            </div>
          </div>

          <Skeleton className="aspect-4/3 w-full rounded-3xl sm:aspect-16/11 lg:col-start-1 lg:row-start-1" />
        </div>
      </div>

      <div className="page-shell space-y-14 pt-12 lg:space-y-20 lg:pt-16">
        <Skeleton className="h-24 w-full rounded-2xl" />

        <div className="space-y-6">
          <Skeleton className="h-7 w-52" />
          <div className="grid gap-4 sm:grid-cols-2">
            {["a", "b", "c", "d"].map((key) => (
              <Skeleton key={key} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="space-y-6">
            <Skeleton className="h-7 w-48" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
          <Skeleton className="h-[30rem] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
