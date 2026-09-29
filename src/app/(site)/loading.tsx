import { GridPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the fallback for any site route without its own. */
export default function Loading() {
  return <GridPageSkeleton count={3} />;
}
