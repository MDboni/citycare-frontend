import { ListPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — a list of applications. */
export default function Loading() {
  return <ListPageSkeleton rows={6} columns={4} />;
}
