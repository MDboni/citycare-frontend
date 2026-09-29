import { ArticlePageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — this page reads the taxonomy before it renders. */
export default function Loading() {
  return <ArticlePageSkeleton />;
}
