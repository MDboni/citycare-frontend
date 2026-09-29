import { ListPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — a filtered list of complaints. */
export default function Loading() {
  return <ListPageSkeleton rows={6} columns={4} />;
}
