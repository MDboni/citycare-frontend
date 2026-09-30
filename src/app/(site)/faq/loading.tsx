import {
  ArticlePageSkeleton,
  BannerSkeleton,
} from "@/components/shared/loading";

/** Route-level loading UI — this page reads the SLA targets and the fees. Opens with the banner, as the page does. */
export default function Loading() {
  return (
    <>
      <BannerSkeleton />
      <ArticlePageSkeleton />
    </>
  );
}
