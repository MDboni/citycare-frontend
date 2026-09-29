import { GridPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the service catalogue. */
export default function Loading() {
  return <GridPageSkeleton count={6} />;
}
