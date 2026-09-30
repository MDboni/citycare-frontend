import {
  ArticlePageSkeleton,
  BannerSkeleton,
} from "@/components/shared/loading";

/** Route-level loading UI — this page reads the taxonomy before it renders. Opens with the banner, as the page does. */
export default function Loading() {
  return (
    <>
      <BannerSkeleton />
      <ArticlePageSkeleton />
    </>
  );
}
