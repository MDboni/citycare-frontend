import { DetailPageSkeleton } from "@/components/shared/loading";

/**
 * Route-level loading UI. Its own file rather than inheriting the payments
 * list's skeleton, which would flash a table where a checkout is about to be.
 */
export default function Loading() {
  return <DetailPageSkeleton />;
}
