import { ListPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — a list of payments. */
export default function Loading() {
  return <ListPageSkeleton rows={6} columns={4} />;
}
