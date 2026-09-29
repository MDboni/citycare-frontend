import { FormPageSkeleton } from "@/components/shared/loading";

/** Route-level loading UI — the application form. */
export default function Loading() {
  return <FormPageSkeleton fields={6} />;
}
