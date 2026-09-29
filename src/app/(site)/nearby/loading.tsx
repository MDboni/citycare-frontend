import { GridPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — nearby issues as cards. */
export default function Loading() {
  return <GridPageSkeleton count={6} />;
}
