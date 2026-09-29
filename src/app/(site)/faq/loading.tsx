import { GridPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — a static page of cards. */
export default function Loading() {
  return <GridPageSkeleton count={4} />;
}
