import { FormPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the public tracking lookup. */
export default function Loading() {
  return <FormPageSkeleton fields={2} />;
}
